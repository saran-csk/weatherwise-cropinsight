
import React from 'react';
import { InsightData } from '@/services/geminiService';
import { BarChart3, ArrowUpRight, AlertTriangle, TrendingUp, BadgeDollarSign } from 'lucide-react';
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
            <BadgeDollarSign className="text-blue-600 mr-2" size={24} />
            <h2 className="text-2xl font-semibold">Tamil Nadu Agribusiness Insights</h2>
          </div>
          
          <div className="mt-6 animate-slide-up">
            <h3 className="text-lg font-medium mb-2 flex items-center border-b border-blue-200 pb-2 text-blue-700">
              <TrendingUp size={18} className="mr-2" />
              Market Analysis
            </h3>
            <div className="text-text-dark bg-soft-gray p-4 rounded-lg shadow-sm">
              <p className="whitespace-pre-line leading-relaxed">
                {insights.market.outlook}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="stagger-animate">
              <div className="animate-slide-up">
                <h3 className="text-lg font-medium flex items-center text-blue-700 border-b border-blue-200 pb-2">
                  <ArrowUpRight size={18} className="mr-2" />
                  Strategic Recommendations
                </h3>
                <ul className="mt-3 space-y-2">
                  {insights.market.recommendations && insights.market.recommendations.length > 0 ? (
                    insights.market.recommendations.map((rec, index) => (
                      <li 
                        key={index} 
                        className="bg-blue-50 text-blue-800 rounded-lg px-4 py-2.5 text-sm shadow-sm"
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
                <h3 className="text-lg font-medium flex items-center text-amber-700 border-b border-amber-200 pb-2">
                  <AlertTriangle size={18} className="mr-2" />
                  Risk Assessment & Mitigation
                </h3>
                <ul className="mt-3 space-y-2">
                  {insights.market.risks && insights.market.risks.length > 0 ? (
                    insights.market.risks.map((risk, index) => (
                      <li 
                        key={index} 
                        className="bg-amber-50 text-amber-800 rounded-lg px-4 py-2.5 text-sm shadow-sm"
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
