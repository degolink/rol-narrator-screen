import { useEffect, useState, useCallback } from 'react';
import { ReadyState } from 'react-use-websocket';

import { useAudioRecorder } from './useAudioRecorder';
import { CONNECTION_LABELS } from './helpers';
import { RecorderHeader } from './RecorderHeader';
import { MicPermissionAlert } from './MicPermissionAlert';
import { WaveformVisualizer } from './WaveformVisualizer';
import { RecorderTimer } from './RecorderTimer';
import { RecorderControls } from './RecorderControls';

export function RecorderCard() {
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

  // ── Fullscreen toggle ──────────────────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  // ── Derived state ──────────────────────────────────────────────────
  const isRecording = recorderState === 'recording';
  const isPaused = recorderState === 'paused';
  const isInactive = recorderState === 'inactive';
  const connInfo =
    CONNECTION_LABELS[connectionState] ??
    CONNECTION_LABELS[ReadyState.UNINSTANTIATED];
  const isConnected = connectionState === ReadyState.OPEN;

  return (
    <div className="relative rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-2xl shadow-indigo-500/5 p-6 sm:p-10">
      {/* Subtle gradient glow behind card */}
      <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-indigo-500/10 via-transparent to-purple-500/5 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8">
        <RecorderHeader
          isInactive={isInactive}
          isConnected={isConnected}
          connInfo={connInfo}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />

        <MicPermissionAlert micPermission={micPermission} />

        {/* ── Waveform Visualizer ────────────────────────────────── */}
        <div className="w-full rounded-xl bg-white/[0.02] border border-white/[0.05] p-3 overflow-hidden">
          <WaveformVisualizer
            analyserNode={analyserNode}
            isActive={isRecording}
          />
        </div>

        <RecorderTimer
          elapsedTime={elapsedTime}
          isRecording={isRecording}
          isPaused={isPaused}
          isInactive={isInactive}
        />

        <RecorderControls
          isRecording={isRecording}
          isPaused={isPaused}
          isInactive={isInactive}
          micPermission={micPermission}
          onStart={startRecording}
          onResume={resumeRecording}
          onPause={pauseRecording}
          onStop={stopRecording}
        />

        {/* ── Max duration hint ──────────────────────────────────── */}
        <p className="text-[10px] text-gray-600 text-center">
          Duración máxima: 6 horas · audio/ogg
        </p>
      </div>
    </div>
  );
}
