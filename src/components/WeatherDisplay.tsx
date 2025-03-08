
import React, { useEffect } from 'react';
import { WeatherData } from '@/services/weatherService';
import { getWeatherIconUrl } from '@/services/weatherService';
import { Cloud, Droplets, Wind, Sunrise, Sunset, Eye, AlertTriangle, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import Glass from './Glass';
import AnimatedTransition from './AnimatedTransition';

interface WeatherDisplayProps {
  weather: WeatherData;
  isVisible: boolean;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weather, isVisible }) => {
  if (!weather) return null;

  useEffect(() => {
    if (weather.actualCity && weather.city !== weather.actualCity) {
      toast.info(
        `Showing weather for ${weather.actualCity} as "${weather.city}" was not found`,
        { duration: 5000 }
      );
    }
  }, [weather]);

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const tempRounded = Math.round(weather.temperature);
  const feelsLikeRounded = Math.round(weather.feels_like);
  
  return (
    <AnimatedTransition 
      show={isVisible} 
      animation="slide-up" 
      className="w-full max-w-3xl mx-auto mt-8"
      delay={100}
    >
      <Glass className="p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 opacity-10 pointer-events-none">
          <Cloud className="w-full h-full text-weather-dark-blue" />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between">
            <div className="text-center md:text-left">
              <div className="stagger-animate">
                <h1 className="animate-slide-up text-3xl md:text-4xl font-semibold flex items-center justify-center md:justify-start">
                  {weather.city}, {weather.country}
                  {weather.actualCity && weather.city !== weather.actualCity && (
                    <span className="ml-2 text-amber-500" title={`Actual data from ${weather.actualCity}`}>
                      <AlertTriangle size={20} />
                    </span>
                  )}
                </h1>
                <p className="animate-slide-up text-text-light mt-1">
                  {formatDate(weather.dt)}
                  {weather.actualCity && weather.city !== weather.actualCity && (
                    <span className="ml-2 text-sm text-amber-500">
                      (Data from {weather.actualCity})
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center mt-4 md:mt-0 animate-slide-up">
              <img 
                src={getWeatherIconUrl(weather.icon)} 
                alt={weather.description} 
                className="w-20 h-20"
                loading="lazy"
              />
              <div className="text-5xl md:text-6xl font-light ml-2">
                {tempRounded}°
              </div>
            </div>
          </div>
          
          <div className="mt-6 md:mt-8">
            <p className="text-lg md:text-xl capitalize text-center md:text-left animate-slide-up">
              {weather.description}
            </p>
            <p className="text-text-light text-center md:text-left animate-slide-up">
              Feels like {feelsLikeRounded}°C
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="stagger-animate">
              <WeatherStat 
                icon={<Droplets className="text-blue-500" size={22} />}
                label="Humidity"
                value={`${weather.humidity}%`}
              />
              
              <WeatherStat 
                icon={<Wind className="text-blue-400" size={22} />}
                label="Wind"
                value={`${weather.wind_speed} m/s`}
              />
              
              <WeatherStat 
                icon={<Cloud className="text-gray-500" size={22} />}
                label="Clouds"
                value={`${weather.clouds}%`}
              />
              
              <WeatherStat 
                icon={<Eye className="text-indigo-400" size={22} />}
                label="Visibility"
                value={`${(weather.visibility / 1000).toFixed(1)} km`}
              />
              
              <WeatherStat 
                icon={<Sunrise className="text-amber-500" size={22} />}
                label="Sunrise"
                value={formatTime(weather.sunrise)}
              />
              
              <WeatherStat 
                icon={<Sunset className="text-orange-500" size={22} />}
                label="Sunset"
                value={formatTime(weather.sunset)}
              />
            </div>
          </div>
          
          {weather.additionalCities && weather.additionalCities.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Other Cities in Tamil Nadu</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {weather.additionalCities.map((city, index) => (
                  <Glass key={index} className="p-4 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MapPin size={18} className="text-weather-dark-blue mr-2" />
                        <h3 className="font-medium">{city.name}</h3>
                      </div>
                      <div className="flex items-center">
                        <img 
                          src={getWeatherIconUrl(city.icon)} 
                          alt={city.description}
                          className="w-10 h-10"
                          loading="lazy"
                        />
                        <span className="text-xl font-light ml-1">
                          {Math.round(city.temperature)}°
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-text-light mt-1 capitalize">{city.description}</p>
                  </Glass>
                ))}
              </div>
            </div>
          )}
        </div>
      </Glass>
    </AnimatedTransition>
  );
};

interface WeatherStatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const WeatherStat: React.FC<WeatherStatProps> = ({ icon, label, value }) => {
  return (
    <div className="flex items-center p-3 bg-white/50 rounded-xl animate-slide-up">
      <div className="mr-3">{icon}</div>
      <div>
        <p className="text-xs text-text-light">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
};

export default WeatherDisplay;
