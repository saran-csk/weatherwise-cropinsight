
import React from 'react';
import { WeatherData } from '@/services/weatherService';
import { getWeatherIconUrl } from '@/services/weatherService';
import { Cloud, Droplets, Wind, Sunrise, Sunset, Eye } from 'lucide-react';
import Glass from './Glass';
import AnimatedTransition from './AnimatedTransition';

interface WeatherDisplayProps {
  weather: WeatherData;
  isVisible: boolean;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weather, isVisible }) => {
  if (!weather) return null;

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
                </h1>
                <p className="animate-slide-up text-text-light mt-1">
                  {formatDate(weather.dt)}
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
