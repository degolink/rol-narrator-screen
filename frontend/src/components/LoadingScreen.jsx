import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Title } from '@/components/ui/Title';

/**
 * A unified global loading screen for the application.
 *
 * @param {Object} props
 * @param {string} [props.message="Cargando..."] - Optional message to display
 * @param {boolean} [props.fullScreen=true] - Whether it should take the full screen height
 * @param {string} [props.className] - Additional classes for the container
 */
export function LoadingScreen({
  message = 'Cargando...',
  fullScreen = true,
  className,
}) {
  return (
    <div
      className={cn(
        'bg-[#0a0a0c] flex flex-col items-center justify-center gap-4 transition-all duration-300',
        fullScreen ? 'min-h-screen w-full' : 'p-8',
        className,
      )}
    >
      <div className="relative flex items-center justify-center">
        {/* Outer Glow */}
        <div className="absolute w-16 h-16 bg-blue-600/20 rounded-full blur-xl animate-pulse"></div>

        {/* Animated Spinner */}
        <Loader2
          className="w-12 h-12 text-blue-500 animate-spin-slow drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
          strokeWidth={1.5}
        />
      </div>

      {!!message && (
        <Title
          as="p"
          className="text-xs uppercase animate-pulse tracking-[0.2em]"
        >
          {message}
        </Title>
      )}
    </div>
  );
}
