
export interface WeatherData {
  city: string;
  actualCity?: string; // Store the actual city name when using fallback
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
  additionalCities?: {
    name: string;
    temperature: number;
    description: string;
    icon: string;
  }[];
}

export interface WeatherError {
  message: string;
  code?: number;
}

const API_KEY = "78ed2d072cbd2f6f7c4f18e94578b0db";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// Tamil Nadu cities for fallback
const TAMIL_NADU_CITIES = [
  "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", 
  "Salem", "Tirunelveli", "Thoothukudi", "Vellore", 
  "Erode", "Dindigul", "Thanjavur", "Ranipet"
];

// Get a random item from an array
const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Fetch weather for multiple cities
const fetchMultipleCitiesWeather = async (cities: string[]) => {
  const weatherPromises = cities.map(async (city) => {
    try {
      const response = await fetch(
        `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      return {
        name: data.name,
        temperature: data.main.temp,
        description: data.weather[0].description,
        icon: data.weather[0].icon
      };
    } catch (error) {
      return null;
    }
  });
  
  const results = await Promise.all(weatherPromises);
  return results.filter(result => result !== null);
};

export const fetchWeatherData = async (
  city: string
): Promise<WeatherData | WeatherError> => {
  try {
    const response = await fetch(
      `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
      // If city not found, use a random Tamil Nadu city as fallback
      if (response.status === 404) {
        const fallbackCity = getRandomItem(TAMIL_NADU_CITIES);
        console.log(`City "${city}" not found, using fallback: ${fallbackCity}`);
        
        const fallbackResponse = await fetch(
          `${BASE_URL}?q=${encodeURIComponent(fallbackCity)}&appid=${API_KEY}&units=metric`
        );
        
        if (!fallbackResponse.ok) {
          const errorData = await fallbackResponse.json();
          return {
            message: errorData.message || 'Failed to fetch weather data for fallback city',
            code: fallbackResponse.status
          };
        }
        
        const data = await fallbackResponse.json();
        
        // Get weather for additional 3 random Tamil Nadu cities
        const otherCities = TAMIL_NADU_CITIES
          .filter(c => c !== fallbackCity)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        
        const additionalCitiesData = await fetchMultipleCitiesWeather(otherCities);
        
        return {
          city: city, // Keep the searched city name
          actualCity: data.name, // Store the actual city we got data for
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
          dt: data.dt,
          additionalCities: additionalCitiesData
        };
      }
      
      // For other errors, return the error message
      const errorData = await response.json();
      return {
        message: errorData.message || 'Failed to fetch weather data',
        code: response.status
      };
    }

    const data = await response.json();
    
    // Get weather for additional 3 random Tamil Nadu cities
    const randomCities = TAMIL_NADU_CITIES
      .filter(c => c !== data.name)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    const additionalCitiesData = await fetchMultipleCitiesWeather(randomCities);
    
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
      dt: data.dt,
      additionalCities: additionalCitiesData
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
    
    // Get weather for additional 3 random Tamil Nadu cities
    const randomCities = TAMIL_NADU_CITIES
      .filter(c => c !== data.name)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    const additionalCitiesData = await fetchMultipleCitiesWeather(randomCities);
    
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
      dt: data.dt,
      additionalCities: additionalCitiesData
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
