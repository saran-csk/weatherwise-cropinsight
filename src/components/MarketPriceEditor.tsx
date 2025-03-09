
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { DollarSign, Plus, Trash2, Save, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MarketPrice {
  id: string;
  crop: string;
  price: string;
  lastWeekPrice: string;
  trend: 'up' | 'down' | 'stable';
  category: 'vegetable' | 'fruit' | 'grain';
}

const MarketPriceEditor: React.FC = () => {
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [newItem, setNewItem] = useState<Omit<MarketPrice, 'id' | 'trend'>>({
    crop: '',
    price: '',
    lastWeekPrice: '',
    category: 'vegetable'
  });

  useEffect(() => {
    const savedPrices = localStorage.getItem('marketPrices');
    if (savedPrices) {
      setMarketPrices(JSON.parse(savedPrices));
    }
  }, []);

  const saveToLocalStorage = (prices: MarketPrice[]) => {
    localStorage.setItem('marketPrices', JSON.stringify(prices));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setNewItem(prev => ({ 
      ...prev, 
      category: value as 'vegetable' | 'fruit' | 'grain' 
    }));
  };

  const calculateTrend = (current: string, previous: string): 'up' | 'down' | 'stable' => {
    const currentNum = parseFloat(current.replace(/[^\d.]/g, ''));
    const previousNum = parseFloat(previous.replace(/[^\d.]/g, ''));
    
    if (isNaN(currentNum) || isNaN(previousNum)) return 'stable';
    
    if (currentNum > previousNum) return 'up';
    if (currentNum < previousNum) return 'down';
    return 'stable';
  };

  const handleAddItem = () => {
    if (!newItem.crop || !newItem.price || !newItem.lastWeekPrice) {
      toast.error('Please fill all fields');
      return;
    }

    const trend = calculateTrend(newItem.price, newItem.lastWeekPrice);
    
    const newPriceItem: MarketPrice = {
      id: Date.now().toString(),
      ...newItem,
      trend
    };

    const updatedPrices = [...marketPrices, newPriceItem];
    setMarketPrices(updatedPrices);
    saveToLocalStorage(updatedPrices);
    
    setNewItem({
      crop: '',
      price: '',
      lastWeekPrice: '',
      category: 'vegetable'
    });
    
    toast.success('Price added successfully');
  };

  const handleDeleteItem = (id: string) => {
    const updatedPrices = marketPrices.filter(item => item.id !== id);
    setMarketPrices(updatedPrices);
    saveToLocalStorage(updatedPrices);
    toast.info('Price removed');
  };

  const renderTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} className="text-green-600" />;
      case 'down':
        return <TrendingDown size={16} className="text-red-600" />;
      case 'stable':
        return <Minus size={16} className="text-gray-600" />;
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Market Price Management</h2>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6 text-blue-700 text-sm">
        <p>Add or update market prices for various crops. All prices will be displayed on the main page.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name</label>
          <Input 
            name="crop"
            value={newItem.crop}
            onChange={handleInputChange}
            placeholder="e.g. Tomato"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Price (₹/kg)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-4 w-4 text-gray-400" />
            </div>
            <Input 
              name="price"
              value={newItem.price}
              onChange={handleInputChange}
              placeholder="e.g. 50"
              className="pl-9"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Week Price (₹/kg)</label>
          <Input 
            name="lastWeekPrice"
            value={newItem.lastWeekPrice}
            onChange={handleInputChange}
            placeholder="e.g. 45"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <Select value={newItem.category} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vegetable">Vegetable</SelectItem>
              <SelectItem value="fruit">Fruit</SelectItem>
              <SelectItem value="grain">Grain</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="mb-8">
        <Button onClick={handleAddItem} className="flex items-center gap-2 w-full md:w-auto">
          <Plus size={16} />
          Add Price
        </Button>
      </div>
      
      {marketPrices.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Week</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {marketPrices.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{item.crop}</td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">{item.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{item.price}/kg</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{item.lastWeekPrice}/kg</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {renderTrendIcon(item.trend)}
                      <span className="ml-1 text-sm">
                        {item.trend === 'up' ? 'Rising' : item.trend === 'down' ? 'Falling' : 'Stable'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No market prices added yet.</p>
        </div>
      )}
    </div>
  );
};

export default MarketPriceEditor;
