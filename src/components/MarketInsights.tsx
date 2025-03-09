
import React from 'react';
import { InsightData } from '@/services/geminiService';
import { BarChart3, ArrowUpRight, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Glass from './Glass';
import AnimatedTransition from './AnimatedTransition';

interface MarketInsightsProps {
  insights: InsightData;
  isVisible: boolean;
}

const MarketInsights: React.FC<MarketInsightsProps> = ({ insights, isVisible }) => {
  if (!insights) return null;
  
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
                    <th className="py-2 px-4 text-left text-sm font-medium text-indigo-800">Price</th>
                    <th className="py-2 px-4 text-left text-sm font-medium text-indigo-800">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {insights.market.prices && insights.market.prices.length > 0 ? (
                    insights.market.prices.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="py-2 px-4 text-sm">{item.crop}</td>
                        <td className="py-2 px-4 text-sm font-medium">{item.price}</td>
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
                      <td colSpan={3} className="text-center py-4 text-gray-500">
                        No market price data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">
              * Prices are approximate and may vary based on quality and location within Tamil Nadu
            </p>
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
              </div>
            </div>
          </div>
        </div>
      </Glass>
    </AnimatedTransition>
  );
};

export default MarketInsights;
