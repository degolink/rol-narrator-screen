import { useState, useEffect, useCallback, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import useWebSocket from 'react-use-websocket';
import { useUser } from '@/context/UserContext';
import { api } from '@/services/apiService';
import { Header } from '@/components/Header';
import { CronistStatusCard } from './components/CronistStatusCard';
import { SessionListCard } from './components/SessionListCard';
import { SessionDetailsCard } from './components/SessionDetailsCard';

const STATUS_LABELS = {
  WAITING: 'Esperando',
  TRANSCRIBING: 'Transcribiendo...',
  SUMMARIZING: 'Resumiendo...',
  PAUSED: 'Pausado',
  COMPLETED: 'Completado',
};

export function CronistForgePage() {
  const { user } = useUser();
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('WAITING');

  const wsUrl = useMemo(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws/chronicler/progress/`;
  }, []);

  const { lastJsonMessage, readyState } = useWebSocket(wsUrl, {
    shouldReconnect: () => true,
  });

  const fetchSessions = useCallback(async () => {
    try {
      const response = await api.get('/chronicler/');
      setSessions(response.data);
    } catch (err) {
      console.error('Error fetching sessions', err);
    }
  }, []);

  const handleStartProcess = useCallback(
    async (sessionId) => {
      try {
        await api.post(`/chronicler/${sessionId}/process/`);
        toast.info('Iniciando procesamiento...');
        fetchSessions();
      } catch (err) {
        toast.error(
          'Error al iniciar: ' + (err.response?.data?.error || err.message),
        );
      }
    },
    [fetchSessions],
  );

  const handlePostpone = useCallback(
    async (sessionId) => {
      try {
        await api.post(`/chronicler/${sessionId}/postpone/`);
        toast.warning('Procesamiento pospuesto 2 horas');
        fetchSessions();
      } catch (err) {
        console.error('Error al posponer', err);
        toast.error('Error al posponer');
      }
    },
    [fetchSessions],
  );

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (lastJsonMessage && lastJsonMessage.type === 'progress_update') {
      setProgress(lastJsonMessage.progress);
      setStatusMsg(lastJsonMessage.status);
      if (lastJsonMessage.status === 'COMPLETED') {
        toast.success('¡El Cronista ha terminado de escribir la sesión!');
        fetchSessions();
      }
    }
  }, [lastJsonMessage, fetchSessions]);

  if (!user?.profile?.is_dungeon_master) {
    return <Navigate to="/" />;
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <Header
        title="LA FORJA DEL CRONISTA"
        description="Gestiona las crónicas de tus aventuras y supervisa el trabajo de la IA."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CronistStatusCard
          progress={progress}
          statusMsg={statusMsg}
          statusLabel={STATUS_LABELS[statusMsg] || statusMsg}
          readyState={readyState}
          sessionId={sessions[0]?.id}
          onPostpone={handlePostpone}
          onStart={handleStartProcess}
        />

        <SessionListCard
          sessions={sessions}
          onSelectSession={setActiveSession}
        />
      </div>

      <SessionDetailsCard
        session={activeSession}
        onStartProcess={handleStartProcess}
      />
    </div>
  );
}
