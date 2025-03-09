
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import WeatherSearch from '@/components/WeatherSearch';
import WeatherDisplay from '@/components/WeatherDisplay';
import CropInsights from '@/components/CropInsights';
import MarketInsights from '@/components/MarketInsights';
import ChatAssistant from '@/components/ChatAssistant';
import AnimatedTransition from '@/components/AnimatedTransition';
import { Button } from '@/components/ui/button';
import { 
  fetchWeatherData, 
  fetchWeatherByCoords,
  getLocationWeather,
  WeatherData,
  WeatherError 
} from '@/services/weatherService';
import { 
  fetchInsights,
  InsightData,
  InsightError 
} from '@/services/geminiService';
import { Leaf, Cloud, ShieldCheck } from 'lucide-react';

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [insightData, setInsightData] = useState<InsightData | null>(null);
  const [isWeatherVisible, setIsWeatherVisible] = useState(false);
  const [isInsightsVisible, setIsInsightsVisible] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isFirstLoad) {
      setTimeout(() => {
        toast.info("Search for a city to get weather and agricultural insights");
        setIsFirstLoad(false);
      }, 1500);
    }
  }, [isFirstLoad]);

  const handleCitySearch = async (city: string) => {
    setIsLoading(true);
    setIsWeatherVisible(false);
    setIsInsightsVisible(false);
    
    try {
      const data = await fetchWeatherData(city);
      
      if ('message' in data) {
        toast.error(`Error: ${data.message}`);
        setIsLoading(false);
        return;
      }
      
      setWeatherData(data);
      setIsWeatherVisible(true);
      
      if (data.actualCity && data.city !== data.actualCity) {
        toast.info(`Showing weather for ${data.actualCity} (in Tamil Nadu) as "${data.city}" was not found`, {
          duration: 6000
        });
      }
      
      setTimeout(() => fetchAndSetInsights(data), 800);
    } catch (error) {
      console.error("Error in search flow:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleLocationSearch = async () => {
    setIsLoading(true);
    setIsWeatherVisible(false);
    setIsInsightsVisible(false);
    
    try {
      const position = await getLocationWeather();
      const { latitude, longitude } = position.coords;
      
      const data = await fetchWeatherByCoords(latitude, longitude);
      
      if ('message' in data) {
        toast.error(`Error: ${data.message}`);
        setIsLoading(false);
        return;
      }
      
      setWeatherData(data);
      setIsWeatherVisible(true);
      
      setTimeout(() => fetchAndSetInsights(data), 800);
    } catch (error) {
      console.error("Error in location flow:", error);
      toast.error("Couldn't access your location. Please check your browser permissions.");
      setIsLoading(false);
    }
  };

  const fetchAndSetInsights = async (weather: WeatherData) => {
    try {
      const insights = await fetchInsights(weather);
      
      if ('message' in insights) {
        console.error(`Insights error: ${insights.message}`);
        setIsLoading(false);
        return;
      }
      
      setInsightData(insights);
      setIsInsightsVisible(true);
    } catch (error) {
      console.error("Error fetching insights:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-weather-light-blue to-soft-white pb-10">
      <div className="absolute top-0 left-0 w-full h-64 pointer-events-none overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 text-weather-blue opacity-20 animate-pulse-soft">
          <Cloud className="w-full h-full" />
        </div>
        <div className="absolute top-20 -right-10 w-48 h-48 text-weather-blue opacity-10 animate-breathe">
          <Cloud className="w-full h-full" />
        </div>
      </div>
      
      <header className="pt-12 md:pt-16 pb-8 px-4 text-center relative z-10">
        <div className="absolute top-4 right-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin')}
            className="flex items-center gap-1 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
          >
            <ShieldCheck size={16} />
            <span>Admin Login</span>
          </Button>
        </div>
        
        <AnimatedTransition show={true} animation="slide-down">
          <div className="flex items-center justify-center mb-2">
            <Cloud className="text-weather-dark-blue mr-2" size={28} />
            <Leaf className="text-green-600" size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-weather-dark-blue to-blue-800">
            WeatherWise CropInsight
          </h1>
          <p className="mt-3 text-text-light max-w-xl mx-auto">
            Get real-time weather data and AI-powered agricultural insights to optimize your farming decisions.
          </p>
        </AnimatedTransition>
      </header>
      
      <main className="container px-4 relative z-10">
        <WeatherSearch 
          onSearch={handleCitySearch} 
          onLocationSearch={handleLocationSearch} 
          isLoading={isLoading} 
        />
        
        {weatherData && (
          <WeatherDisplay 
            weather={weatherData} 
            isVisible={isWeatherVisible} 
          />
        )}
        
        {insightData && (
          <>
            <CropInsights 
              insights={insightData} 
              isVisible={isInsightsVisible}
              weatherData={weatherData}
            />
            
            <MarketInsights 
              insights={insightData} 
              isVisible={isInsightsVisible} 
            />
          </>
        )}
        
        {isLoading && (
          <div className="flex justify-center mt-12">
            <div className="loader"></div>
          </div>
        )}
      </main>
      
      <ChatAssistant 
        weatherData={weatherData} 
        insightData={insightData} 
      />
      
      <footer className="mt-auto pt-6 pb-4 text-center text-text-light text-sm">
        <AnimatedTransition show={true} animation="fade">
          <p>Powered by OpenWeatherMap and Google Gemini</p>
        </AnimatedTransition>
      </footer>
    </div>
  );
};

export default Index;
