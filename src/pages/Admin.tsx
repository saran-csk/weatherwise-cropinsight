
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import AdminLogin from '@/components/AdminLogin';
import MarketPriceEditor from '@/components/MarketPriceEditor';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (username: string, password: string) => {
    if (username === 'saran' && password === '123') {
      setIsLoggedIn(true);
      localStorage.setItem('adminAuth', 'true');
      toast.success('Logged in successfully');
    } else {
      toast.error('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('adminAuth');
    toast.info('Logged out');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-weather-light-blue to-soft-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Button>
          
          {isLoggedIn && (
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Logout
            </Button>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-center mb-6 text-weather-dark-blue">
            Admin Dashboard
          </h1>
          
          {!isLoggedIn ? (
            <AdminLogin onLogin={handleLogin} />
          ) : (
            <MarketPriceEditor />
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
