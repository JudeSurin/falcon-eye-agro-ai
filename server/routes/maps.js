import express from 'express';
import { Client } from '@googlemaps/google-maps-services-js';
import { query, validationResult } from 'express-validator';
import { logger } from '../utils/logger.js';

const router = express.Router();
const mapsClient = new Client({});

// Geocoding - Convert address to coordinates
router.get('/geocode', [
  query('address').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { address } = req.query;

    const response = await mapsClient.geocode({
      params: {
        address,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.results.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    const result = response.data.results[0];
    
    const geocodeData = {
      address: result.formatted_address,
      coordinates: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng
      },
      bounds: result.geometry.bounds,
      types: result.types,
      components: result.address_components.reduce((acc, component) => {
        component.types.forEach(type => {
          acc[type] = component.long_name;
        });
        return acc;
      }, {})
    };

    res.json({ result: geocodeData });
  } catch (error) {
    logger.error('Geocoding error:', error);
    res.status(500).json({ error: 'Geocoding failed' });
  }
});

// Reverse geocoding - Convert coordinates to address
router.get('/reverse-geocode', [
  query('lat').isFloat({ min: -90, max: 90 }),
  query('lng').isFloat({ min: -180, max: 180 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { lat, lng } = req.query;

    const response = await mapsClient.reverseGeocode({
      params: {
        latlng: `${lat},${lng}`,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.results.length === 0) {
      return res.status(404).json({ error: 'No address found for coordinates' });
    }

    const results = response.data.results.map(result => ({
      address: result.formatted_address,
      types: result.types,
      components: result.address_components.reduce((acc, component) => {
        component.types.forEach(type => {
          acc[type] = component.long_name;
        });
        return acc;
      }, {})
    }));

    res.json({ results });
  } catch (error) {
    logger.error('Reverse geocoding error:', error);
    res.status(500).json({ error: 'Reverse geocoding failed' });
  }
});

// Get elevation for coordinates
router.get('/elevation', [
  query('locations').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { locations } = req.query;

    const response = await mapsClient.elevation({
      params: {
        locations,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    const elevationData = response.data.results.map(result => ({
      location: result.location,
      elevation: result.elevation,
      resolution: result.resolution
    }));

    res.json({ results: elevationData });
  } catch (error) {
    logger.error('Elevation error:', error);
    res.status(500).json({ error: 'Elevation lookup failed' });
  }
});

// Calculate distance and duration between points
router.get('/distance-matrix', [
  query('origins').notEmpty(),
  query('destinations').notEmpty(),
  query('mode').optional().isIn(['driving', 'walking', 'bicycling', 'transit'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { origins, destinations, mode = 'driving' } = req.query;

    const response = await mapsClient.distancematrix({
      params: {
        origins,
        destinations,
        mode,
        units: 'metric',
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    const matrix = response.data.rows.map((row, originIndex) => ({
      origin: response.data.origin_addresses[originIndex],
      destinations: row.elements.map((element, destIndex) => ({
        destination: response.data.destination_addresses[destIndex],
        distance: element.distance,
        duration: element.duration,
        status: element.status
      }))
    }));

    res.json({ matrix });
  } catch (error) {
    logger.error('Distance matrix error:', error);
    res.status(500).json({ error: 'Distance calculation failed' });
  }
});

// Get static map image URL
router.get('/static-map', [
  query('center').optional(),
  query('zoom').optional().isInt({ min: 1, max: 20 }),
  query('size').optional().matches(/^\d+x\d+$/),
  query('markers').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      center = '0,0',
      zoom = 10,
      size = '600x400',
      markers = '',
      maptype = 'satellite'
    } = req.query;

    const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';
    const params = new URLSearchParams({
      center,
      zoom,
      size,
      maptype,
      key: process.env.GOOGLE_MAPS_API_KEY
    });

    if (markers) {
      params.append('markers', markers);
    }

    const mapUrl = `${baseUrl}?${params.toString()}`;

    res.json({ mapUrl });
  } catch (error) {
    logger.error('Static map error:', error);
    res.status(500).json({ error: 'Static map generation failed' });
  }
});

// Get nearby places (for landing zones, obstacles, etc.)
router.get('/nearby-search', [
  query('lat').isFloat({ min: -90, max: 90 }),
  query('lng').isFloat({ min: -180, max: 180 }),
  query('radius').isInt({ min: 1, max: 50000 }),
  query('type').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { lat, lng, radius, type } = req.query;

    const params = {
      location: `${lat},${lng}`,
      radius,
      key: process.env.GOOGLE_MAPS_API_KEY
    };

    if (type) {
      params.type = type;
    }

    const response = await mapsClient.placesNearby({ params });

    const places = response.data.results.map(place => ({
      id: place.place_id,
      name: place.name,
      vicinity: place.vicinity,
      location: place.geometry.location,
      types: place.types,
      rating: place.rating,
      priceLevel: place.price_level,
      openNow: place.opening_hours?.open_now,
      photos: place.photos?.map(photo => ({
        reference: photo.photo_reference,
        width: photo.width,
        height: photo.height
      })) || []
    }));

    res.json({ places });
  } catch (error) {
    logger.error('Nearby search error:', error);
    res.status(500).json({ error: 'Nearby search failed' });
  }
});

// Validate flight path for obstacles and no-fly zones
router.post('/validate-flight-path', [
  query('path').isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { path } = req.body;
    
    // Check for airports and restricted airspace
    const validationResults = await Promise.all(
      path.map(async (point, index) => {
        try {
          // Search for nearby airports
          const airportSearch = await mapsClient.placesNearby({
            params: {
              location: `${point.lat},${point.lng}`,
              radius: 5000, // 5km radius
              type: 'airport',
              key: process.env.GOOGLE_MAPS_API_KEY
            }
          });

          // Check elevation for terrain obstacles
          const elevationResponse = await mapsClient.elevation({
            params: {
              locations: `${point.lat},${point.lng}`,
              key: process.env.GOOGLE_MAPS_API_KEY
            }
          });

          return {
            index,
            point,
            elevation: elevationResponse.data.results[0]?.elevation || 0,
            nearbyAirports: airportSearch.data.results.map(airport => ({
              name: airport.name,
              distance: calculateDistance(point, airport.geometry.location)
            })),
            warnings: [],
            clearance: 'approved'
          };
        } catch (error) {
          logger.warn(`Validation failed for point ${index}:`, error);
          return {
            index,
            point,
            warnings: ['Unable to validate this waypoint'],
            clearance: 'warning'
          };
        }
      })
    );

    // Add warnings based on validation
    validationResults.forEach(result => {
      if (result.nearbyAirports && result.nearbyAirports.length > 0) {
        result.warnings.push(`${result.nearbyAirports.length} airport(s) nearby`);
        result.clearance = 'restricted';
      }
      
      if (result.elevation > 500) {
        result.warnings.push('High terrain elevation');
        result.clearance = 'warning';
      }
    });

    const overallClearance = validationResults.some(r => r.clearance === 'restricted') 
      ? 'restricted' 
      : validationResults.some(r => r.clearance === 'warning') 
        ? 'warning' 
        : 'approved';

    res.json({
      validation: {
        overallClearance,
        waypoints: validationResults,
        summary: {
          totalWaypoints: path.length,
          restrictedWaypoints: validationResults.filter(r => r.clearance === 'restricted').length,
          warningWaypoints: validationResults.filter(r => r.clearance === 'warning').length,
          recommendations: generateFlightRecommendations(validationResults)
        }
      }
    });

  } catch (error) {
    logger.error('Flight path validation error:', error);
    res.status(500).json({ error: 'Flight path validation failed' });
  }
});

// Helper function to calculate distance between two points
function calculateDistance(point1, point2) {
  const R = 6371; // Earth's radius in km
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLon = (point2.lng - point1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function generateFlightRecommendations(validationResults) {
  const recommendations = [];
  
  const restrictedCount = validationResults.filter(r => r.clearance === 'restricted').length;
  const warningCount = validationResults.filter(r => r.clearance === 'warning').length;
  
  if (restrictedCount > 0) {
    recommendations.push('Consider alternative route to avoid restricted airspace');
    recommendations.push('Check local aviation authorities for flight permissions');
  }
  
  if (warningCount > 0) {
    recommendations.push('Exercise extra caution at highlighted waypoints');
    recommendations.push('Monitor weather conditions closely');
  }
  
  recommendations.push('Maintain visual line of sight with aircraft');
  recommendations.push('Have emergency landing procedures ready');
  
  return recommendations;
}

export default router;