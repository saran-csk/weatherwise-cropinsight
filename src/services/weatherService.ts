
export interface WeatherData {
  city: string;
  actualCity?: string; // New field to store the actual city name when using fallback
  country: string;
  temperature: number;
  feels_like: number;
  description: string;
  icon: string;
  humidity: number;
  wind_speed: number;
  pressure: number;
  sunrise: number;
  sunset: number;
  coords: {
    lat: number;
    lon: number;
  };
  visibility: number;
  clouds: number;
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
  dt: number; // timestamp of data calculation
}

export interface WeatherError {
  message: string;
  code?: number;
}

const API_KEY = "78ed2d072cbd2f6f7c4f18e94578b0db";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

export const fetchWeatherData = async (
  city: string
): Promise<WeatherData | WeatherError> => {
  try {
    const response = await fetch(
      `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        message: errorData.message || 'Failed to fetch weather data',
        code: response.status
      };
    }

    const data = await response.json();
    
    return {
      city: data.name,
      country: data.sys.country,
      temperature: data.main.temp,
      feels_like: data.main.feels_like,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
      pressure: data.main.pressure,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      coords: {
        lat: data.coord.lat,
        lon: data.coord.lon,
      },
      visibility: data.visibility,
      clouds: data.clouds.all,
      rain: data.rain,
      dt: data.dt
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return {
      message: 'Failed to connect to weather service',
    };
  }
};

export const fetchWeatherByCoords = async (
  lat: number,
  lon: number
): Promise<WeatherData | WeatherError> => {
  try {
    const response = await fetch(
      `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        message: errorData.message || 'Failed to fetch weather data',
        code: response.status
      };
    }

    const data = await response.json();
    
    return {
      city: data.name,
      country: data.sys.country,
      temperature: data.main.temp,
      feels_like: data.main.feels_like,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
      pressure: data.main.pressure,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      coords: {
        lat: data.coord.lat,
        lon: data.coord.lon,
      },
      visibility: data.visibility,
      clouds: data.clouds.all,
      rain: data.rain,
      dt: data.dt
    };
  } catch (error) {
    console.error("Error fetching weather data by coordinates:", error);
    return {
      message: 'Failed to connect to weather service',
    };
  }
};

export const getLocationWeather = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    }
  });
};

export const getWeatherIconUrl = (iconCode: string): string => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};
