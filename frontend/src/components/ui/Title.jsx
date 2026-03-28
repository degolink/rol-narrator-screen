import React from 'react';
import { cn } from '@/lib/cn';

/**
 * A reusable Title component with 'Press Start 2P' typography.
 * 
 * @param {Object} props
 * @param {string} [props.as="h1"] - The HTML tag to render
 * @param {string} [props.className] - Additional classes
 * @param {React.ReactNode} props.children - The title content
 */
export function Title({ 
  as: Component = "h1", 
  className,
  children,
  ...props 
}) {
  return (
    <Component
      style={{
        fontFamily: "'Press Start 2P', cursive",
        textShadow: '0 0 12px rgba(255, 204, 0, 0.4)',
      }}
      className={cn(
        "font-bold text-yellow-300 tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
