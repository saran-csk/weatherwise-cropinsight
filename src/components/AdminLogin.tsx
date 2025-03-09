
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, User } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (username: string, password: string) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-blue-50 p-4 rounded-lg mb-6 text-blue-700 text-sm">
        <p>Please login to access the admin dashboard.</p>
        <p className="mt-1 text-xs">Username: saran, Password: 123</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10"
              placeholder="Enter username"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              placeholder="Enter password"
              required
            />
          </div>
        </div>
        
        <Button type="submit" className="w-full">
          Login
        </Button>
      </form>
    </div>
  );
};

export default AdminLogin;
