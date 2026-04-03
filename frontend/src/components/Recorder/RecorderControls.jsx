import { Mic, Pause, Square, Play } from 'lucide-react';

export function RecorderControls({
  isRecording,
  isPaused,
  isInactive,
  micPermission,
  onStart,
  onResume,
  onPause,
  onStop,
}) {
  const micBlocked = micPermission === 'denied' || micPermission === 'error';

  return (
    <div className="flex items-center gap-5 sm:gap-8">
      {/* Record / Resume button */}
      <button
        onClick={isInactive ? onStart : onResume}
        disabled={isRecording || micBlocked}
        className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
        id="record-button"
        title={isInactive ? 'Grabar' : 'Reanudar'}
      >
        <div
          className={`absolute inset-0 rounded-full transition-all duration-300 ${
            isRecording
              ? 'bg-gray-700/50'
              : 'bg-red-500 group-hover:bg-red-400 group-hover:shadow-lg group-hover:shadow-red-500/30 group-disabled:bg-gray-700/50 group-disabled:shadow-none'
          }`}
        />
        {isPaused ? (
          <Play className="relative z-10 w-7 h-7 sm:w-8 sm:h-8 text-white" />
        ) : (
          <Mic className="relative z-10 w-7 h-7 sm:w-8 sm:h-8 text-white" />
        )}
      </button>

      {/* Pause button */}
      <button
        onClick={onPause}
        disabled={!isRecording}
        className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
        id="pause-button"
        title="Pausar"
      >
        <div className="absolute inset-0 rounded-full bg-amber-500/80 group-hover:bg-amber-400 group-hover:shadow-lg group-hover:shadow-amber-500/30 transition-all duration-300 group-disabled:bg-gray-700/50 group-disabled:shadow-none" />
        <Pause className="relative z-10 w-7 h-7 sm:w-8 sm:h-8 text-white" />
      </button>

      {/* Stop button */}
      <button
        onClick={onStop}
        disabled={isInactive}
        className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
        id="stop-button"
        title="Detener"
      >
        <div className="absolute inset-0 rounded-full bg-indigo-500/80 group-hover:bg-indigo-400 group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-all duration-300 group-disabled:bg-gray-700/50 group-disabled:shadow-none" />
        <Square className="relative z-10 w-6 h-6 sm:w-7 sm:h-7 text-white" />
      </button>
    </div>
  );
}
