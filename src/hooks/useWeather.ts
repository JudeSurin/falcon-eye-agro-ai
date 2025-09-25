import { useQuery } from '@tanstack/react-query';
import { weatherAPI } from '@/services/apiClient';

export interface WeatherData {
  location: {
    name: string;
    country: string;
    coordinates: { lat: number; lon: number };
  };
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    visibility: number;
    cloudCover: number;
    condition: string;
    description: string;
    icon: string;
  };
  wind: {
    speed: number;
    direction: number;
    gust?: number;
  };
  flight: {
    suitable: boolean;
    score: number;
    factors: string[];
    recommendation: string;
  };
  timestamp: string;
}

export const useCurrentWeather = (lat: number, lon: number) => {
  return useQuery({
    queryKey: ['weather', 'current', lat, lon],
    queryFn: () => weatherAPI.getCurrentWeather(lat, lon),
    select: (data) => data.data.weather as WeatherData,
    enabled: !!(lat && lon),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useWeatherForecast = (lat: number, lon: number, days = 5) => {
  return useQuery({
    queryKey: ['weather', 'forecast', lat, lon, days],
    queryFn: () => weatherAPI.getForecast(lat, lon, days),
    select: (data) => data.data.forecast,
    enabled: !!(lat && lon),
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
  });
};

export const useWeatherAlerts = (lat: number, lon: number) => {
  return useQuery({
    queryKey: ['weather', 'alerts', lat, lon],
    queryFn: () => weatherAPI.getAlerts(lat, lon),
    select: (data) => data.data,
    enabled: !!(lat && lon),
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};