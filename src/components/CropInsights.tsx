
import React from 'react';
import { InsightData } from '@/services/geminiService';
import { Leaf, ThumbsDown, CheckCircle2, Thermometer, AlertCircle, Info } from 'lucide-react';
import Glass from './Glass';
import AnimatedTransition from './AnimatedTransition';
import { WeatherData } from '@/services/weatherService';

interface CropInsightsProps {
  insights: InsightData;
  isVisible: boolean;
  weatherData?: WeatherData;
}

const CropInsights: React.FC<CropInsightsProps> = ({ insights, isVisible, weatherData }) => {
  if (!insights) return null;
  
  return (
    <AnimatedTransition 
      show={isVisible} 
      animation="slide-up" 
      className="w-full max-w-3xl mx-auto mt-6"
      delay={200}
    >
      <Glass className="p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 opacity-5 pointer-events-none">
          <Leaf className="w-full h-full" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <Leaf className="text-green-600 mr-2" size={24} />
            <h2 className="text-2xl font-semibold">Crop Insights</h2>
            {weatherData && (
              <div className="ml-auto flex items-center text-gray-600">
                <Thermometer size={18} className="mr-1" />
                <span className="text-sm">{Math.round(weatherData.temperature)}°C</span>
              </div>
            )}
          </div>
          
          <div className="mt-2 mb-4 bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
            <p className="font-medium">
              These recommendations are specifically tailored for Tamil Nadu's agricultural conditions at the current temperature
              {weatherData ? ` of ${Math.round(weatherData.temperature)}°C in ${weatherData.city}` : ''}.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="stagger-animate">
              <div className="animate-slide-up">
                <h3 className="text-lg font-medium flex items-center text-green-700">
                  <CheckCircle2 size={18} className="mr-2" />
                  Recommended Crops
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {insights.crops.recommended.length > 0 ? (
                    insights.crops.recommended.map((crop, index) => (
                      <span 
                        key={index} 
                        className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm"
                      >
                        {crop}
                      </span>
                    ))
                  ) : (
                    <p className="text-text-light text-sm">No specific crop recommendations available.</p>
                  )}
                </div>
                <div className="mt-3 bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-800">
                    <Info size={14} className="inline mr-1" />
                    These crops are ideal for Tamil Nadu's current climate conditions. They're expected to have good yield and market demand.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="stagger-animate">
              <div className="animate-slide-up">
                <h3 className="text-lg font-medium flex items-center text-red-700">
                  <ThumbsDown size={18} className="mr-2" />
                  Crops to Avoid
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {insights.crops.avoid.length > 0 ? (
                    insights.crops.avoid.map((crop, index) => (
                      <span 
                        key={index} 
                        className="bg-red-100 text-red-800 rounded-full px-3 py-1 text-sm"
                      >
                        {crop}
                      </span>
                    ))
                  ) : (
                    <p className="text-text-light text-sm">No specific crops to avoid mentioned.</p>
                  )}
                </div>
                <div className="mt-3 bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-800">
                    <AlertCircle size={14} className="inline mr-1" />
                    These crops may face challenges in the current climate conditions in Tamil Nadu, leading to poor yield or increased susceptibility to diseases.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 animate-slide-up">
            <h3 className="text-lg font-medium mb-2">Management Advice</h3>
            <p className="text-text-dark bg-soft-gray p-4 rounded-lg">
              {insights.crops.management}
            </p>
          </div>

          <div className="mt-6 bg-amber-50 p-4 rounded-lg animate-slide-up">
            <h3 className="text-lg font-medium mb-2 text-amber-800 flex items-center">
              <AlertCircle size={18} className="mr-2" />
              Tamil Nadu Agriculture Tips
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-amber-800">
              <li>Use drought-resistant varieties when planting during summer months</li>
              <li>Consider integrated pest management to reduce chemical usage</li>
              <li>Implement drip irrigation systems to conserve water</li>
              <li>Follow Tamil Nadu Agricultural University recommendations for specific crop varieties</li>
              <li>Monitor weather forecasts regularly for planning field operations</li>
            </ul>
          </div>

          {weatherData && (
            <div className="mt-6 bg-blue-50 p-4 rounded-lg animate-slide-up">
              <h3 className="text-lg font-medium mb-2 text-blue-800 flex items-center">
                <Thermometer size={18} className="mr-2" />
                Temperature-Based Recommendations
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                Current temperature in {weatherData.city}: <span className="font-bold">{Math.round(weatherData.temperature)}°C</span>
              </p>
              
              {Math.round(weatherData.temperature) < 25 ? (
                <div className="space-y-2">
                  <p className="text-blue-800">This cooler temperature is suitable for:</p>
                  <ul className="list-disc pl-5 space-y-1 text-blue-800">
                    <li>Leafy vegetables like spinach, lettuce, and cabbage</li>
                    <li>Root vegetables like carrots, radishes, and beetroot</li>
                    <li>Cruciferous vegetables like cauliflower and broccoli</li>
                    <li>Peas and certain varieties of beans</li>
                  </ul>
                </div>
              ) : Math.round(weatherData.temperature) < 30 ? (
                <div className="space-y-2">
                  <p className="text-blue-800">This moderate temperature is optimal for:</p>
                  <ul className="list-disc pl-5 space-y-1 text-blue-800">
                    <li>Most vegetable crops including tomatoes, peppers, and eggplants</li>
                    <li>Many grain crops like rice, millets, and certain wheat varieties</li>
                    <li>A wide range of fruit crops adapted to Tamil Nadu</li>
                    <li>Most pulses and oilseed crops</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-blue-800">This warmer temperature is better for:</p>
                  <ul className="list-disc pl-5 space-y-1 text-blue-800">
                    <li>Heat-tolerant crops like okra, sweet potatoes, and amaranth</li>
                    <li>Drought-resistant millets like pearl millet and finger millet</li>
                    <li>Cotton and specific varieties of pulses</li>
                    <li>Many tropical fruit trees like mango, papaya, and banana</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </Glass>
    </AnimatedTransition>
  );
};

export default CropInsights;
