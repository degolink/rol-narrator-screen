import { useRef, useEffect, useState, useCallback } from 'react';
import { ReadyState } from 'react-use-websocket';
import {
  Mic,
  Pause,
  Square,
  Maximize,
  Minimize,
  WifiOff,
  Wifi,
  ShieldAlert,
  MicOff,
  Play,
} from 'lucide-react';
import { useAudioRecorder } from './useAudioRecorder';

// ── Helpers ──────────────────────────────────────────────────────────

function formatTime(totalSeconds) {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');

  if (hrs > 0) return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  return `${pad(mins)}:${pad(secs)}`;
}

const CONNECTION_LABELS = {
  [ReadyState.CONNECTING]: { label: 'Conectando…', color: 'bg-yellow-500' },
  [ReadyState.OPEN]: { label: 'Conectado', color: 'bg-emerald-500' },
  [ReadyState.CLOSING]: { label: 'Desconectando…', color: 'bg-yellow-500' },
  [ReadyState.CLOSED]: { label: 'Desconectado', color: 'bg-red-500' },
  [ReadyState.UNINSTANTIATED]: {
    label: 'Sin conexión',
    color: 'bg-gray-500',
  },
};

// ── Waveform Canvas ──────────────────────────────────────────────────

function WaveformVisualizer({ analyserNode, isActive }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      const analyser = analyserNode?.current;
      if (!analyser || !isActive) {
        // Draw idle waveform (flat line with subtle pulse)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
        ctx.lineWidth = 2;
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height * 0.85;

        // Gradient from indigo to violet
        const hue = 250 + (i / bufferLength) * 40;
        const lightness = 45 + (dataArray[i] / 255) * 25;
        ctx.fillStyle = `hsl(${hue}, 80%, ${lightness}%)`;

        // Draw bar from center
        const y = (height - barHeight) / 2;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth - 1, barHeight, 2);
        ctx.fill();

        x += barWidth;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [analyserNode, isActive]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-32 sm:h-40 rounded-xl"
      style={{ display: 'block' }}
    />
  );
}

// ── Main Page ────────────────────────────────────────────────────────

export function RecorderPage() {
  const {
    recorderState,
    micPermission,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    analyserNode,
    elapsedTime,
    connectionState,
  } = useAudioRecorder();

  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── Fullscreen toggle ────────────────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  // ── Derived state ────────────────────────────────────────────────
  const isRecording = recorderState === 'recording';
  const isPaused = recorderState === 'paused';
  const isInactive = recorderState === 'inactive';
  const connInfo =
    CONNECTION_LABELS[connectionState] ||
    CONNECTION_LABELS[ReadyState.UNINSTANTIATED];

  const isConnected = connectionState === ReadyState.OPEN;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8">
      <div className="w-full max-w-lg">
        {/* ── Glassmorphism Card ────────────────────────────────── */}
        <div className="relative rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-2xl shadow-indigo-500/5 p-6 sm:p-10">
          {/* Subtle gradient glow behind card */}
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-indigo-500/10 via-transparent to-purple-500/5 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8">
            {/* ── Header ──────────────────────────────────────── */}
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
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${connInfo.color}`}
                    />
                    <span className="hidden sm:inline">{connInfo.label}</span>
                  </div>
                )}

                {/* Fullscreen toggle */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  title={
                    isFullscreen
                      ? 'Salir de pantalla completa'
                      : 'Pantalla completa'
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

            {/* ── Mic Permission Alerts ────────────────────────── */}
            {micPermission === 'denied' && (
              <div className="w-full rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-300">
                    Micrófono bloqueado
                  </p>
                  <p className="text-xs text-red-300/70 mt-1">
                    Para habilitarlo, haz clic en el ícono de candado en la
                    barra de navegación de tu navegador y permite el acceso al
                    micrófono.
                  </p>
                </div>
              </div>
            )}

            {micPermission === 'error' && (
              <div className="w-full rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
                <MicOff className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-300">
                    Micrófono no disponible
                  </p>
                  <p className="text-xs text-amber-300/70 mt-1">
                    No se pudo acceder al micrófono. Verifica que tu dispositivo
                    tenga un micrófono conectado.
                  </p>
                </div>
              </div>
            )}

            {/* ── Waveform Visualizer ──────────────────────────── */}
            <div className="w-full rounded-xl bg-white/[0.02] border border-white/[0.05] p-3 overflow-hidden">
              <WaveformVisualizer
                analyserNode={analyserNode}
                isActive={isRecording}
              />
            </div>

            {/* ── Timer ────────────────────────────────────────── */}
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

            {/* ── State Label ──────────────────────────────────── */}
            <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
              {isRecording && 'Grabando'}
              {isPaused && 'En pausa'}
              {isInactive && 'Listo para grabar'}
            </p>

            {/* ── Control Buttons ──────────────────────────────── */}
            <div className="flex items-center gap-5 sm:gap-8">
              {/* Record / Resume button */}
              <button
                onClick={isInactive ? startRecording : resumeRecording}
                disabled={
                  isRecording ||
                  micPermission === 'denied' ||
                  micPermission === 'error'
                }
                className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                id="record-button"
                title={isInactive ? 'Grabar' : 'Reanudar'}
              >
                {/* Button background */}
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
                onClick={pauseRecording}
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
                onClick={stopRecording}
                disabled={isInactive}
                className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                id="stop-button"
                title="Detener"
              >
                <div className="absolute inset-0 rounded-full bg-indigo-500/80 group-hover:bg-indigo-400 group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-all duration-300 group-disabled:bg-gray-700/50 group-disabled:shadow-none" />
                <Square className="relative z-10 w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </button>
            </div>

            {/* ── Max duration hint ────────────────────────────── */}
            <p className="text-[10px] text-gray-600 text-center">
              Duración máxima: 6 horas · audio/ogg
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
