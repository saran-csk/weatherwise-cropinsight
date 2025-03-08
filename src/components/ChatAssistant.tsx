
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Glass from './Glass';
import AnimatedTransition from './AnimatedTransition';
import { InsightData } from '@/services/geminiService';
import { WeatherData } from '@/services/weatherService';

interface ChatAssistantProps {
  weatherData: WeatherData | null;
  insightData: InsightData | null;
}

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ weatherData, insightData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm your agricultural assistant. Ask me about crop recommendations, market insights, or weather interpretations!", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    // Focus input when chat opens
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const generateResponse = (query: string): string => {
    query = query.toLowerCase();
    
    if (!weatherData || !insightData) {
      return "Please search for a location first to get weather data and insights.";
    }
    
    if (query.includes('recommend') || query.includes('crops') || query.includes('grow') || query.includes('plant')) {
      if (insightData.crops.recommended.length > 0) {
        return `Based on the current weather in ${weatherData.city}, I recommend growing: ${insightData.crops.recommended.join(', ')}. ${insightData.crops.management}`;
      }
      return "I don't have specific crop recommendations for this weather condition.";
    }
    
    if (query.includes('avoid') || query.includes('not grow') || query.includes('bad')) {
      if (insightData.crops.avoid.length > 0) {
        return `Given the current conditions in ${weatherData.city}, you should avoid planting: ${insightData.crops.avoid.join(', ')}.`;
      }
      return "I don't have specific crops to avoid for this weather condition.";
    }
    
    if (query.includes('market') || query.includes('sell') || query.includes('prices') || query.includes('demand')) {
      return `Market Outlook: ${insightData.market.outlook}\n\nRecommendations: ${insightData.market.recommendations.join(', ')}\n\nRisks to monitor: ${insightData.market.risks.join(', ')}`;
    }
    
    if (query.includes('weather') || query.includes('temperature') || query.includes('rain') || query.includes('forecast')) {
      return `Current weather in ${weatherData.city}: ${weatherData.temperature}°C, ${weatherData.description}. Humidity: ${weatherData.humidity}%, Wind: ${weatherData.wind_speed} m/s.`;
    }
    
    if (query.includes('manage') || query.includes('care') || query.includes('maintain')) {
      return insightData.crops.management;
    }
    
    return "I can help with crop recommendations, market insights, and weather interpretations. What specific information are you looking for?";
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = { 
      id: messages.length + 1, 
      text: input, 
      isUser: true 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Generate AI response
    setTimeout(() => {
      const response = generateResponse(input);
      const aiMessage: Message = {
        id: messages.length + 2,
        text: response,
        isUser: false
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg bg-weather-dark-blue hover:bg-blue-700 text-white"
      >
        <MessageCircle size={24} />
      </Button>
    );
  }

  return (
    <AnimatedTransition 
      show={true} 
      animation="slide-up" 
      className="fixed bottom-6 right-6 w-full max-w-sm sm:max-w-md z-50"
    >
      <Glass className="flex flex-col h-[500px] max-h-[80vh] shadow-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-medium">Agricultural Assistant</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="rounded-full h-8 w-8"
          >
            <X size={18} />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.isUser
                    ? 'bg-weather-dark-blue text-white rounded-tr-none'
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-line">{message.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 py-2 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ask about crops, weather, or market..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button
              onClick={handleSend}
              className="rounded-full h-10 w-10 flex items-center justify-center bg-weather-dark-blue hover:bg-blue-700 text-white"
              disabled={!input.trim()}
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      </Glass>
    </AnimatedTransition>
  );
};

export default ChatAssistant;
