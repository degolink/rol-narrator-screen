import { Maximize, Minimize, Wifi, WifiOff } from 'lucide-react';

export function RecorderHeader({
  isInactive,
  isConnected,
  connInfo,
  isFullscreen,
  onToggleFullscreen,
}) {
  return (
    <div className="flex items-center justify-between w-full">
      <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
        Grabadora
      </h1>

      <div className="flex items-center gap-3">
        {/* Connection status (only visible when active) */}
        {!isInactive && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            {isConnected ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-red-400" />
            )}
            <span className={`w-1.5 h-1.5 rounded-full ${connInfo.color}`} />
            <span className="hidden sm:inline">{connInfo.label}</span>
          </div>
        )}

        {/* Fullscreen toggle */}
        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          title={
            isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'
          }
          id="fullscreen-toggle"
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4" />
          ) : (
            <Maximize className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
