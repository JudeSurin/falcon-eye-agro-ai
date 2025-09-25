import express from 'express';
import axios from 'axios';
import { query, validationResult } from 'express-validator';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get current weather for coordinates
router.get('/current', [
  query('lat').isFloat({ min: -90, max: 90 }),
  query('lon').isFloat({ min: -180, max: 180 }),
  query('units').optional().isIn(['metric', 'imperial', 'kelvin'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { lat, lon, units = 'metric' } = req.query;
    
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat,
        lon,
        appid: process.env.OPENWEATHER_API_KEY,
        units
      },
      timeout: 5000
    });

    const weather = response.data;
    
    // Calculate flight suitability
    const flightConditions = calculateFlightSuitability(weather);

    const weatherData = {
      location: {
        name: weather.name,
        country: weather.sys.country,
        coordinates: { lat: weather.coord.lat, lon: weather.coord.lon }
      },
      current: {
        temperature: weather.main.temp,
        feelsLike: weather.main.feels_like,
        humidity: weather.main.humidity,
        pressure: weather.main.pressure,
        visibility: weather.visibility,
        cloudCover: weather.clouds.all,
        condition: weather.weather[0].main,
        description: weather.weather[0].description,
        icon: weather.weather[0].icon
      },
      wind: {
        speed: weather.wind?.speed || 0,
        direction: weather.wind?.deg || 0,
        gust: weather.wind?.gust || null
      },
      flight: flightConditions,
      timestamp: new Date(),
      units
    };

    res.json({ weather: weatherData });
  } catch (error) {
    logger.error('Current weather error:', error);
    
    if (error.response?.status === 401) {
      return res.status(500).json({ error: 'Weather API authentication failed' });
    } else if (error.code === 'ECONNABORTED') {
      return res.status(500).json({ error: 'Weather API timeout' });
    }
    
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Get weather forecast
router.get('/forecast', [
  query('lat').isFloat({ min: -90, max: 90 }),
  query('lon').isFloat({ min: -180, max: 180 }),
  query('days').optional().isInt({ min: 1, max: 5 }),
  query('units').optional().isIn(['metric', 'imperial', 'kelvin'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { lat, lon, days = 5, units = 'metric' } = req.query;
    
    const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: {
        lat,
        lon,
        appid: process.env.OPENWEATHER_API_KEY,
        units,
        cnt: days * 8 // 8 forecasts per day (every 3 hours)
      },
      timeout: 5000
    });

    const forecast = response.data;
    
    const forecastData = {
      location: {
        name: forecast.city.name,
        country: forecast.city.country,
        coordinates: { lat: forecast.city.coord.lat, lon: forecast.city.coord.lon }
      },
      forecasts: forecast.list.map(item => ({
        timestamp: new Date(item.dt * 1000),
        temperature: {
          current: item.main.temp,
          min: item.main.temp_min,
          max: item.main.temp_max,
          feelsLike: item.main.feels_like
        },
        humidity: item.main.humidity,
        pressure: item.main.pressure,
        visibility: item.visibility,
        cloudCover: item.clouds.all,
        condition: item.weather[0].main,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        wind: {
          speed: item.wind?.speed || 0,
          direction: item.wind?.deg || 0,
          gust: item.wind?.gust || null
        },
        precipitation: {
          probability: item.pop * 100,
          rain: item.rain?.['3h'] || 0,
          snow: item.snow?.['3h'] || 0
        },
        flight: calculateFlightSuitability(item)
      })),
      units
    };

    res.json({ forecast: forecastData });
  } catch (error) {
    logger.error('Weather forecast error:', error);
    
    if (error.response?.status === 401) {
      return res.status(500).json({ error: 'Weather API authentication failed' });
    } else if (error.code === 'ECONNABORTED') {
      return res.status(500).json({ error: 'Weather API timeout' });
    }
    
    res.status(500).json({ error: 'Failed to fetch weather forecast' });
  }
});

// Get weather alerts
router.get('/alerts', [
  query('lat').isFloat({ min: -90, max: 90 }),
  query('lon').isFloat({ min: -180, max: 180 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { lat, lon } = req.query;
    
    const response = await axios.get('https://api.openweathermap.org/data/3.0/onecall', {
      params: {
        lat,
        lon,
        appid: process.env.OPENWEATHER_API_KEY,
        exclude: 'current,minutely,hourly,daily'
      },
      timeout: 5000
    });

    const alerts = response.data.alerts || [];
    
    const alertData = {
      alerts: alerts.map(alert => ({
        event: alert.event,
        start: new Date(alert.start * 1000),
        end: new Date(alert.end * 1000),
        description: alert.description,
        severity: determineSeverity(alert.event),
        flightImpact: determineFlightImpact(alert.event)
      })),
      count: alerts.length
    };

    res.json(alertData);
  } catch (error) {
    logger.error('Weather alerts error:', error);
    
    // If One Call API is not available, return empty alerts
    if (error.response?.status === 401 || error.response?.status === 403) {
      return res.json({ alerts: [], count: 0 });
    }
    
    res.status(500).json({ error: 'Failed to fetch weather alerts' });
  }
});

// Helper function to calculate flight suitability
function calculateFlightSuitability(weather) {
  const windSpeed = weather.wind?.speed || 0;
  const visibility = weather.visibility || 10000;
  const cloudCover = weather.clouds?.all || 0;
  const condition = weather.weather?.[0]?.main || 'Clear';
  const precipitation = weather.rain?.['3h'] || weather.snow?.['3h'] || 0;

  let score = 100;
  let factors = [];
  let suitable = true;

  // Wind speed impact
  if (windSpeed > 15) {
    score -= 50;
    suitable = false;
    factors.push('High wind speed');
  } else if (windSpeed > 10) {
    score -= 25;
    factors.push('Moderate wind speed');
  } else if (windSpeed > 7) {
    score -= 10;
    factors.push('Light wind');
  }

  // Visibility impact
  if (visibility < 1000) {
    score -= 40;
    suitable = false;
    factors.push('Poor visibility');
  } else if (visibility < 5000) {
    score -= 20;
    factors.push('Reduced visibility');
  }

  // Weather condition impact
  const badConditions = ['Rain', 'Snow', 'Thunderstorm', 'Drizzle'];
  if (badConditions.includes(condition)) {
    score -= 60;
    suitable = false;
    factors.push(`${condition} conditions`);
  } else if (condition === 'Mist' || condition === 'Fog') {
    score -= 30;
    factors.push('Reduced visibility conditions');
  }

  // Cloud cover impact
  if (cloudCover > 80) {
    score -= 15;
    factors.push('Heavy cloud cover');
  } else if (cloudCover > 60) {
    score -= 10;
    factors.push('Moderate cloud cover');
  }

  // Precipitation impact
  if (precipitation > 0) {
    score -= 30;
    suitable = false;
    factors.push('Active precipitation');
  }

  return {
    suitable,
    score: Math.max(0, score),
    factors,
    recommendation: suitable ? 'Conditions are suitable for flight' : 'Flight not recommended'
  };
}

function determineSeverity(event) {
  const highSeverity = ['Tornado', 'Hurricane', 'Thunderstorm', 'Blizzard'];
  const mediumSeverity = ['Heavy Rain', 'Snow', 'High Wind', 'Fog'];
  
  if (highSeverity.some(severe => event.toLowerCase().includes(severe.toLowerCase()))) {
    return 'high';
  } else if (mediumSeverity.some(medium => event.toLowerCase().includes(medium.toLowerCase()))) {
    return 'medium';
  }
  return 'low';
}

function determineFlightImpact(event) {
  const noFly = ['Tornado', 'Hurricane', 'Thunderstorm', 'Blizzard', 'Heavy Rain'];
  const caution = ['Wind', 'Snow', 'Fog', 'Rain'];
  
  if (noFly.some(condition => event.toLowerCase().includes(condition.toLowerCase()))) {
    return 'no-fly';
  } else if (caution.some(condition => event.toLowerCase().includes(condition.toLowerCase()))) {
    return 'caution';
  }
  return 'monitor';
}

export default router;