
import React, { useEffect, useState } from 'react';
import { InsightData } from '@/services/geminiService';
import { BarChart3, ArrowUpRight, AlertTriangle, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import Glass from './Glass';
import AnimatedTransition from './AnimatedTransition';

interface MarketInsightsProps {
  insights: InsightData;
  isVisible: boolean;
}

interface MarketPrice {
  id: string;
  crop: string;
  price: string;
  marketPrice: string;
  lastWeekPrice: string;
  trend: 'up' | 'down' | 'stable';
  category: 'vegetable' | 'fruit' | 'grain';
}

const MarketInsights: React.FC<MarketInsightsProps> = ({ insights, isVisible }) => {
  const [localMarketPrices, setLocalMarketPrices] = useState<MarketPrice[]>([]);
  
  useEffect(() => {
    const savedPrices = localStorage.getItem('marketPrices');
    if (savedPrices) {
      setLocalMarketPrices(JSON.parse(savedPrices));
    }
  }, []);
  
  if (!insights) return null;
  
  const displayPrices = localMarketPrices.length > 0 
    ? localMarketPrices
    : insights.market.prices.map(price => ({
        id: String(Math.random()),
        crop: price.crop,
        price: price.price.replace('₹', '').replace('/kg', ''),
        marketPrice: price.price.replace('₹', '').replace('/kg', ''),
        lastWeekPrice: '0',
        trend: price.trend,
        category: 'vegetable'
      }));
  
  return (
    <AnimatedTransition 
      show={isVisible} 
      animation="slide-up" 
      className="w-full max-w-3xl mx-auto mt-6 mb-12"
      delay={300}
    >
      <Glass className="p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 opacity-5 pointer-events-none">
          <BarChart3 className="w-full h-full" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <BarChart3 className="text-blue-600 mr-2" size={24} />
            <h2 className="text-2xl font-semibold">Market Insights</h2>
          </div>
          
          <div className="mt-6 animate-slide-up">
            <h3 className="text-lg font-medium mb-2">Market Outlook</h3>
            <p className="text-text-dark bg-soft-gray p-4 rounded-lg">
              {insights.market.outlook}
            </p>
          </div>
          
          {/* Current Market Prices Section */}
          <div className="mt-6 animate-slide-up">
            <h3 className="text-lg font-medium mb-3 text-indigo-700 flex items-center">
              <TrendingUp size={18} className="mr-2" />
              Current Tamil Nadu Market Prices
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="py-2 px-4 text-left text-sm font-medium text-indigo-800">Crop</th>
                    <th className="py-2 px-4 text-left text-sm font-medium text-indigo-800">Category</th>
                    <th className="py-2 px-4 text-left text-sm font-medium text-indigo-800">Current Price</th>
                    <th className="py-2 px-4 text-left text-sm font-medium text-indigo-800">Market Price</th>
                    <th className="py-2 px-4 text-left text-sm font-medium text-indigo-800">Last Week</th>
                    <th className="py-2 px-4 text-left text-sm font-medium text-indigo-800">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayPrices && displayPrices.length > 0 ? (
                    displayPrices.map((item, index) => (
                      <tr key={item.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="py-2 px-4 text-sm">{item.crop}</td>
                        <td className="py-2 px-4 text-sm capitalize">{item.category}</td>
                        <td className="py-2 px-4 text-sm font-medium">₹{item.price}/kg</td>
                        <td className="py-2 px-4 text-sm font-medium">₹{item.marketPrice || item.price}/kg</td>
                        <td className="py-2 px-4 text-sm font-medium">₹{item.lastWeekPrice}/kg</td>
                        <td className="py-2 px-4">
                          <div className="flex items-center">
                            {item.trend === 'up' ? (
                              <>
                                <TrendingUp size={16} className="text-green-600 mr-1" />
                                <span className="text-sm text-green-600">Rising</span>
                              </>
                            ) : item.trend === 'down' ? (
                              <>
                                <TrendingDown size={16} className="text-red-600 mr-1" />
                                <span className="text-sm text-red-600">Falling</span>
                              </>
                            ) : (
                              <>
                                <Minus size={16} className="text-gray-600 mr-1" />
                                <span className="text-sm text-gray-600">Stable</span>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-gray-500">
                        No market price data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-2 bg-indigo-50 p-3 rounded-lg">
              <p className="text-sm text-indigo-800">
                <Info size={14} className="inline mr-1" />
                Tamil Nadu Agricultural Marketing Board updates these prices daily from major markets across the state. Prices may vary by location and quality.
              </p>
            </div>
            {localMarketPrices.length > 0 && (
              <p className="text-xs text-gray-500 mt-2 italic">
                * Prices updated by admin
              </p>
            )}
            {localMarketPrices.length === 0 && (
              <p className="text-xs text-gray-500 mt-2 italic">
                * Prices are approximate and may vary based on quality and location within Tamil Nadu
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="stagger-animate">
              <div className="animate-slide-up">
                <h3 className="text-lg font-medium flex items-center text-blue-700">
                  <ArrowUpRight size={18} className="mr-2" />
                  Recommendations
                </h3>
                <ul className="mt-3 space-y-2">
                  {insights.market.recommendations.length > 0 ? (
                    insights.market.recommendations.map((rec, index) => (
                      <li 
                        key={index} 
                        className="bg-blue-50 text-blue-800 rounded-lg px-4 py-2 text-sm"
                      >
                        {rec}
                      </li>
                    ))
                  ) : (
                    <p className="text-text-light text-sm">No specific market recommendations available.</p>
                  )}
                </ul>
                <div className="mt-3 bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <Info size={14} className="inline mr-1" />
                    These recommendations are based on current market trends and weather conditions in Tamil Nadu.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="stagger-animate">
              <div className="animate-slide-up">
                <h3 className="text-lg font-medium flex items-center text-amber-700">
                  <AlertTriangle size={18} className="mr-2" />
                  Risks to Monitor
                </h3>
                <ul className="mt-3 space-y-2">
                  {insights.market.risks.length > 0 ? (
                    insights.market.risks.map((risk, index) => (
                      <li 
                        key={index} 
                        className="bg-amber-50 text-amber-800 rounded-lg px-4 py-2 text-sm"
                      >
                        {risk}
                      </li>
                    ))
                  ) : (
                    <p className="text-text-light text-sm">No specific risks mentioned.</p>
                  )}
                </ul>
                <div className="mt-3 bg-amber-50 p-3 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <AlertTriangle size={14} className="inline mr-1" />
                    Monitoring these risks can help farmers make informed decisions and minimize potential losses.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Glass>
    </AnimatedTransition>
  );
};

export default MarketInsights;
