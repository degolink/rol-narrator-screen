import { formatTime } from './helpers';

export function RecorderTimer({
  elapsedTime,
  isRecording,
  isPaused,
  isInactive,
}) {
  return (
    <>
      {/* ── Timer ──────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Pulsing red dot when recording */}
        <div
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            isRecording
              ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50'
              : isPaused
                ? 'bg-yellow-500'
                : 'bg-gray-600'
          }`}
        />
        <span className="text-4xl sm:text-5xl font-mono font-bold text-white tabular-nums tracking-wider">
          {formatTime(elapsedTime)}
        </span>
      </div>

      {/* ── State Label ────────────────────────────── */}
      <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
        {isRecording && 'Grabando'}
        {isPaused && 'En pausa'}
        {isInactive && 'Listo para grabar'}
      </p>
    </>
  );
}
