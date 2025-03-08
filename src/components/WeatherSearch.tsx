
import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import Glass from './Glass';
import AnimatedTransition from './AnimatedTransition';

interface WeatherSearchProps {
  onSearch: (city: string) => void;
  onLocationSearch: () => void;
  isLoading: boolean;
}

const WeatherSearch: React.FC<WeatherSearchProps> = ({
  onSearch,
  onLocationSearch,
  isLoading
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    } else {
      toast.error('Please enter a city name');
      inputRef.current?.focus();
    }
  };

  const handleLocationSearch = () => {
    toast.info('Finding your location...');
    onLocationSearch();
  };

  // Focus the input on component mount
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
  }, []);

  return (
    <AnimatedTransition 
      show={true} 
      animation="slide-down" 
      className="w-full max-w-2xl mx-auto"
    >
      <Glass 
        className={`p-2 md:p-3 transition-all duration-300 ${
          isFocused ? 'shadow-medium' : 'shadow-soft'
        }`}
        hoverEffect
      >
        <form onSubmit={handleSearch} className="flex items-center relative">
          <div className="text-text-light ml-2 mr-1">
            <Search size={20} strokeWidth={2} />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            className="flex-1 py-2 px-3 text-base md:text-lg input-clean text-text-dark placeholder:text-text-light"
            placeholder="Search for a city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isLoading}
          />
          
          <div className="flex gap-1">
            <Button 
              type="button" 
              size="icon" 
              variant="ghost" 
              className="rounded-full h-9 w-9 text-text-light hover:text-text-dark hover:bg-medium-gray"
              onClick={handleLocationSearch}
              disabled={isLoading}
            >
              <MapPin size={18} />
            </Button>
            
            <Button 
              type="submit" 
              className="rounded-full py-2 px-4 bg-weather-dark-blue hover:bg-blue-600 text-white transition-colors duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </div>
        </form>
      </Glass>
    </AnimatedTransition>
  );
};

export default WeatherSearch;
