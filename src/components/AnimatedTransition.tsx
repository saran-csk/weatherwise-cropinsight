
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type AnimationType = 'fade' | 'slide-up' | 'slide-down' | 'slide-right' | 'none';

interface AnimatedTransitionProps {
  children: React.ReactNode;
  className?: string;
  show: boolean;
  animation?: AnimationType;
  duration?: number;
  delay?: number;
}

export const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({
  children,
  className,
  show,
  animation = 'fade',
  duration = 300,
  delay = 0,
}) => {
  const [shouldRender, setShouldRender] = useState(show);
  const [animationClass, setAnimationClass] = useState<string>('');

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      // Small timeout to ensure DOM update before animation starts
      setTimeout(() => {
        const animClass = getAnimationClass(animation, true);
        setAnimationClass(animClass);
      }, 10);
    } else {
      const animClass = getAnimationClass(animation, false);
      setAnimationClass(animClass);
      
      setTimeout(() => {
        setShouldRender(false);
      }, duration);
    }
  }, [show, animation, duration]);

  const getAnimationClass = (type: AnimationType, isEntering: boolean): string => {
    if (type === 'none') return '';
    
    switch (type) {
      case 'fade':
        return isEntering ? 'animate-fade-in' : 'animate-fade-out';
      case 'slide-up':
        return isEntering ? 'animate-slide-up' : 'animate-fade-out';
      case 'slide-down':
        return isEntering ? 'animate-slide-down' : 'animate-fade-out';
      case 'slide-right':
        return isEntering ? 'animate-slide-in-right' : 'animate-fade-out';
      default:
        return '';
    }
  };

  const style = {
    animationDuration: `${duration}ms`,
    animationDelay: delay ? `${delay}ms` : undefined,
  };

  if (!shouldRender) return null;

  return (
    <div className={cn(animationClass, className)} style={style}>
      {children}
    </div>
  );
};

export default AnimatedTransition;
