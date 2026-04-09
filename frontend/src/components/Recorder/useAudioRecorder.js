import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { toast } from 'sonner';
import { WS_BASE_URL } from '@/config';

const MAX_DURATION_SECONDS = 6 * 60 * 60; // 6 hours

/**
 * Custom hook for real-time audio recording via WebSocket streaming.
 *
 * Manages MediaRecorder, Wake Lock, Web Audio API (waveform), and
 * reconnection resilience. Streams binary audio chunks every 2s.
 */
export function useAudioRecorder() {
  // ── State ──────────────────────────────────────────────────────────
  const [recorderState, setRecorderState] = useState('inactive'); // "inactive" | "recording" | "paused"
  const [micPermission, setMicPermission] = useState('prompt'); // "prompt" | "granted" | "denied" | "error"
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionId, setSessionId] = useState(null);

  // ── Refs ────────────────────────────────────────────────────────────
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserNodeRef = useRef(null);
  const wakeLockRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedElapsedRef = useRef(0);
  const chunkQueueRef = useRef([]);
  const recorderStateRef = useRef('inactive');

  // Keep refs in sync with state/ws values so closures always read current values
  const readyStateRef = useRef(ReadyState.UNINSTANTIATED);
  const sendMessageRef = useRef(null);
  const sendJsonMessageRef = useRef(null);

  // ── WebSocket ──────────────────────────────────────────────────────
  const socketUrl = useMemo(() => `${WS_BASE_URL}/recording/`, []);

  const shouldConnect = recorderState !== 'inactive';

  const { sendMessage, sendJsonMessage, lastJsonMessage, readyState } =
    useWebSocket(shouldConnect ? socketUrl : null, {
      shouldReconnect: () => true,
      reconnectAttempts: 20,
      reconnectInterval: 2000,
    });

  // Keep refs in sync
  useEffect(() => {
    readyStateRef.current = readyState;
  }, [readyState]);

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  useEffect(() => {
    sendJsonMessageRef.current = sendJsonMessage;
  }, [sendJsonMessage]);

  useEffect(() => {
    recorderStateRef.current = recorderState;
  }, [recorderState]);

  // ── Mic permission check on mount ──────────────────────────────────
  useEffect(() => {
    if (!navigator.permissions?.query) return; // Safari fallback

    let permStatus;

    navigator.permissions
      .query({ name: 'microphone' })
      .then((status) => {
        permStatus = status;
        setMicPermission(status.state);
        status.addEventListener('change', () => {
          setMicPermission(status.state);
        });
      })
      .catch(() => {});

    return () => {
      if (permStatus) {
        permStatus.removeEventListener?.('change', () => {});
      }
    };
  }, []);

  // ── Handle backend control responses ───────────────────────────────
  useEffect(() => {
    if (!lastJsonMessage) return;

    const { type, session_id, message } = lastJsonMessage;

    if (type === 'started' && session_id) {
      setSessionId(session_id);
    } else if (type === 'stopped') {
      setSessionId(null);
    } else if (type === 'max_duration') {
      toast.warning(message || 'Límite de grabación alcanzado (6 horas).');
      performStop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastJsonMessage]);

  // ── Reconnection resilience ────────────────────────────────────────
  useEffect(() => {
    if (recorderState === 'inactive') return;

    if (readyState === ReadyState.OPEN) {
      // Flush queued chunks accumulated while disconnected
      const queue = chunkQueueRef.current;
      if (queue.length > 0) {
        queue.forEach((chunk) => sendMessage(chunk));
        chunkQueueRef.current = [];
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readyState]);

  // ── Timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (recorderState === 'recording') {
      startTimeRef.current = Date.now();
      timerIntervalRef.current = setInterval(() => {
        const seconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedTime(seconds);

        if (seconds >= MAX_DURATION_SECONDS) {
          toast.warning('Límite de grabación alcanzado (6 horas).');
          performStop();
        }
      }, 500);
      if (startTimeRef.current) {
        pausedElapsedRef.current += Math.floor(
          (Date.now() - startTimeRef.current) / 1000,
        );
      }
      clearInterval(timerIntervalRef.current);
    } else {
      // inactive
      clearInterval(timerIntervalRef.current);
      setElapsedTime(0);
      pausedElapsedRef.current = 0;
      startTimeRef.current = null;
    }

    return () => clearInterval(timerIntervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorderState]);

  // ── Wake Lock ──────────────────────────────────────────────────────
  const acquireWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
    } catch {
      // Wake Lock not available or denied — non-critical
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
  }, []);

  // ── Audio setup / teardown ─────────────────────────────────────────
  // NOTE: setupAudio uses refs (readyStateRef, sendMessageRef) instead of
  // the hook values directly. This prevents the stale-closure bug where
  // ondataavailable would capture an outdated readyState from render time.
  const setupAudio = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStreamRef.current = stream;

    // Web Audio API for waveform visualization
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    audioContextRef.current = audioCtx;
    analyserNodeRef.current = analyser;

    // Pick best supported MIME type
    const mimeType = MediaRecorder.isTypeSupported('audio/ogg; codecs=opus')
      ? 'audio/ogg; codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm; codecs=opus')
        ? 'audio/webm; codecs=opus'
        : '';

    const recorder = new MediaRecorder(stream, {
      ...(mimeType && { mimeType }),
    });

    recorder.ondataavailable = (e) => {
      if (!e.data || e.data.size === 0) return;

      // Use refs so this callback always reads the CURRENT readyState and
      // sendMessage — not the stale values captured at creation time.
      if (readyStateRef.current === ReadyState.OPEN) {
        sendMessageRef.current?.(e.data);
      } else {
        chunkQueueRef.current.push(e.data);
      }
    };

    mediaRecorderRef.current = recorder;
    return recorder;
  }, []); // No deps — exclusively uses refs internally

  const teardownAudio = useCallback(() => {
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      } catch {
        // Already stopped
      }
      mediaRecorderRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
      analyserNodeRef.current = null;
    }
  }, []);

  // ── Control functions ──────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    if (recorderState !== 'inactive') return;
    if (micPermission === 'denied') {
      toast.error(
        'El micrófono está bloqueado. Habilítalo desde la configuración de tu navegador.',
      );
      return;
    }

    try {
      // Connect the WebSocket first by switching state
      setRecorderState('recording');

      const recorder = await setupAudio();
      setMicPermission('granted');
      await acquireWakeLock();

      // Start producing chunks every 2 seconds.
      // The "start" control message is sent separately by the effect below
      // once readyState becomes OPEN.
      recorder.start(2000);
    } catch (err) {
      setRecorderState('inactive');
      if (err.name === 'NotAllowedError') {
        setMicPermission('denied');
        toast.error(
          'Permiso de micrófono denegado. Habilítalo desde la configuración de tu navegador.',
        );
      } else if (
        err.name === 'NotFoundError' ||
        err.name === 'NotReadableError'
      ) {
        setMicPermission('error');
        toast.error(
          'No se pudo acceder al micrófono. Verifica que tengas uno conectado.',
        );
      } else {
        setMicPermission('error');
        toast.error(`Error al iniciar la grabación: ${err.message}`);
      }
    }
  }, [recorderState, micPermission, setupAudio, acquireWakeLock]);

  // Send "start" signal to backend once WebSocket is open and session hasn't begun
  useEffect(() => {
    if (
      recorderState === 'recording' &&
      readyState === ReadyState.OPEN &&
      !sessionId
    ) {
      sendJsonMessage({ type: 'start' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readyState, recorderState, sessionId]);

  const pauseRecording = useCallback(() => {
    if (recorderState !== 'recording') return;

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.pause();
    }
    sendJsonMessageRef.current?.({ type: 'pause' });
    setRecorderState('paused');
  }, [recorderState]);

  const resumeRecording = useCallback(() => {
    if (recorderState !== 'paused') return;

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'paused'
    ) {
      mediaRecorderRef.current.resume();
    }
    sendJsonMessageRef.current?.({ type: 'resume' });
    setRecorderState('recording');
  }, [recorderState]);

  const performStop = useCallback(() => {
    if (readyStateRef.current === ReadyState.OPEN) {
      sendJsonMessageRef.current?.({ type: 'stop' });
    }
    teardownAudio();
    releaseWakeLock();
    chunkQueueRef.current = [];
    setRecorderState('inactive');
    setSessionId(null);
  }, [teardownAudio, releaseWakeLock]);

  const stopRecording = useCallback(() => {
    if (recorderState === 'inactive') return;
    performStop();
  }, [recorderState, performStop]);

  // ── Cleanup on unmount ─────────────────────────────────────────────
  useEffect(() => {
    return () => {
      teardownAudio();
      releaseWakeLock();
      clearInterval(timerIntervalRef.current);
    };
  }, [teardownAudio, releaseWakeLock]);

  return {
    recorderState,
    micPermission,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    analyserNode: analyserNodeRef,
    elapsedTime,
    connectionState: readyState,
    sessionId,
  };
}
