import { Mic, Square } from 'lucide-react';

export function RecorderControls({
  isRecording,
  micPermission,
  onStart,
  onStop,
}) {
  const micBlocked = micPermission === 'denied' || micPermission === 'error';

  return (
    <div className="flex items-center gap-5 sm:gap-12 justify-center">
      {/* Record button */}
      <button
        onClick={onStart}
        disabled={isRecording || micBlocked}
        className="group relative w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
        id="record-button"
        title="Grabar"
      >
        <div
          className={`absolute inset-0 rounded-full transition-all duration-300 ${
            isRecording
              ? 'bg-gray-700/50'
              : 'bg-red-500 group-hover:bg-red-400 group-hover:shadow-lg group-hover:shadow-red-500/30 group-disabled:bg-gray-700/50 group-disabled:shadow-none'
          }`}
        />
        <Mic className="relative z-10 w-8 h-8 sm:w-10 sm:h-10 text-white" />
      </button>

      {/* Stop button */}
      <button
        onClick={onStop}
        disabled={!isRecording}
        className="group relative w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
        id="stop-button"
        title="Detener"
      >
        <div
          className={`absolute inset-0 rounded-full transition-all duration-300 ${
            !isRecording
              ? 'bg-gray-700/50'
              : 'bg-indigo-600 group-hover:bg-indigo-500 group-hover:shadow-lg group-hover:shadow-indigo-500/30'
          }`}
        />
        <Square className="relative z-10 w-7 h-7 sm:w-8 sm:h-8 text-white fill-current" />
      </button>
    </div>
  );
}
