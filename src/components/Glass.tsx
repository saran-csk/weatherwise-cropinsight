
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  borderOpacity?: number;
  hoverEffect?: boolean;
}

export const Glass: React.FC<GlassProps> = ({
  children,
  className,
  intensity = 'medium',
  borderOpacity = 0.1,
  hoverEffect = false,
}) => {
  const getBlurIntensity = () => {
    switch (intensity) {
      case 'low':
        return 'backdrop-blur-sm';
      case 'high':
        return 'backdrop-blur-xl';
      case 'medium':
      default:
        return 'backdrop-blur-md';
    }
  };
  
  return (
    <div
      className={cn(
        'bg-white/70 rounded-2xl border shadow-soft',
        getBlurIntensity(),
        hoverEffect && 'transition-all duration-300 hover:shadow-medium hover:bg-white/80',
        className
      )}
      style={{ borderColor: `rgba(255, 255, 255, ${borderOpacity})` }}
    >
      {children}
    </div>
  );
};

export default Glass;
