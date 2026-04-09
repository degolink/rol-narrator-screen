import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

export const Progress = forwardRef(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative h-2 w-full overflow-hidden rounded-full bg-gray-800',
      className,
    )}
    {...props}
  >
    <div
      className="h-full w-full flex-1 bg-blue-600 transition-all duration-500 ease-in-out"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
));

Progress.displayName = 'Progress';
