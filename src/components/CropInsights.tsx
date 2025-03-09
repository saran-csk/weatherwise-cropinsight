
import React from 'react';
import { InsightData } from '@/services/geminiService';
import { Leaf, ThumbsDown, CheckCircle2, Tractor } from 'lucide-react';
import Glass from './Glass';
import AnimatedTransition from './AnimatedTransition';

interface CropInsightsProps {
  insights: InsightData;
  isVisible: boolean;
}

const CropInsights: React.FC<CropInsightsProps> = ({ insights, isVisible }) => {
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
            <h2 className="text-2xl font-semibold">Tamil Nadu Crop Analysis</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="stagger-animate">
              <div className="animate-slide-up">
                <h3 className="text-lg font-medium flex items-center text-green-700 border-b border-green-200 pb-2">
                  <CheckCircle2 size={18} className="mr-2" />
                  High-Value Crop Opportunities
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {insights.crops.recommended.length > 0 ? (
                    insights.crops.recommended.map((crop, index) => (
                      <span 
                        key={index} 
                        className="bg-green-100 text-green-800 rounded-lg px-3 py-1.5 text-sm font-medium"
                      >
                        {crop}
                      </span>
                    ))
                  ) : (
                    <p className="text-text-light text-sm">No specific crop recommendations available.</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="stagger-animate">
              <div className="animate-slide-up">
                <h3 className="text-lg font-medium flex items-center text-red-700 border-b border-red-200 pb-2">
                  <ThumbsDown size={18} className="mr-2" />
                  Crops With Limited Potential
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {insights.crops.avoid.length > 0 ? (
                    insights.crops.avoid.map((crop, index) => (
                      <span 
                        key={index} 
                        className="bg-red-100 text-red-800 rounded-lg px-3 py-1.5 text-sm font-medium"
                      >
                        {crop}
                      </span>
                    ))
                  ) : (
                    <p className="text-text-light text-sm">No specific crops to avoid mentioned.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 animate-slide-up">
            <h3 className="text-lg font-medium mb-2 flex items-center border-b border-blue-200 pb-2 text-blue-700">
              <Tractor size={18} className="mr-2" />
              Strategic Crop Management
            </h3>
            <div className="text-text-dark bg-soft-gray p-4 rounded-lg shadow-sm">
              <p className="whitespace-pre-line leading-relaxed">
                {insights.crops.management}
              </p>
            </div>
          </div>
        </div>
      </Glass>
    </AnimatedTransition>
  );
};

export default CropInsights;
