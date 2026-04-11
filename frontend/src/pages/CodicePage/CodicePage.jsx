import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import useWebSocket from 'react-use-websocket';
import { useUser } from '@/context/UserContext';
import { api } from '@/services/apiService';
import { Header } from '@/components/Header';
import { SessionSidebar } from './components/SessionSidebar';
import { SessionSummary } from './components/SessionSummary';
import { HeroPath } from './components/HeroPath';
import { FullTranscript } from './components/FullTranscript';
import { ChroniclerManagement } from './components/ChroniclerManagement';

export function CodicePage() {
  const { user } = useUser();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [progress, setProgress] = useState(0);
  const [wsStatus, setWsStatus] = useState('WAITING');
  const activeChar = user?.profile?.active_character;
  const isDM = user?.profile?.is_dungeon_master;

  const wsUrl = useMemo(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws/chronicler/progress/`;
  }, []);

  const { lastJsonMessage, readyState } = useWebSocket(wsUrl, {
    shouldReconnect: () => true,
  });

  const fetchSessions = useCallback(
    async (selectId = null) => {
      try {
        const response = await api.get('/chronicler/');
        setSessions(response.data);
        if (selectId) {
          const selected = response.data.find((s) => s.id === selectId);
          if (selected) setSelectedSession(selected);
        } else if (!selectedSession && response.data.length > 0) {
          setSelectedSession(response.data[0]);
        }
      } catch (err) {
        console.error('Error fetching sessions', err);
      }
    },
    [selectedSession],
  );

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Initial load only

  const sessionsRef = useRef(sessions);
  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  useEffect(() => {
    if (lastJsonMessage && lastJsonMessage.type === 'progress_update') {
      const { session_id, status, progress: newProgress } = lastJsonMessage;

      setProgress(newProgress);
      setWsStatus(status);

      // Only update if something changed to avoid unnecessary renders
      setSessions((prev) => {
        const session = prev.find((s) => s.id === session_id);
        if (session && (session.status !== status || session.progress !== newProgress)) {
          return prev.map((s) => (s.id === session_id ? { ...s, status: status } : s));
        }
        return prev;
      });

      if (status === 'COMPLETED') {
        const wasProcessing =
          sessionsRef.current.find((s) => s.id === session_id)?.status !== 'COMPLETED';
        if (wasProcessing) {
          toast.success('¡El Cronista ha terminado la crónica!');
          fetchSessions(session_id);
        }
      }
    }
  }, [lastJsonMessage, fetchSessions]);

  const handleStartProcess = async (sessionId) => {
    try {
      await api.post(`/chronicler/${sessionId}/process/`);
      toast.info('Iniciando procesamiento...');
      fetchSessions(sessionId);
    } catch (err) {
      toast.error(
        'Error al iniciar: ' + (err.response?.data?.error || err.message),
      );
    }
  };

  const handleStopProcess = async (sessionId) => {
    try {
      await api.post(`/chronicler/${sessionId}/stop/`);
      toast.warning('Procesamiento detenido');
      fetchSessions(sessionId);
    } catch {
      toast.error('Error al detener');
    }
  };

  // Check if ANY session is currently processing to disable buttons globally
  const anySessionProcessing = useMemo(
    () =>
      sessions.some(
        (s) => s.status === 'TRANSCRIBING' || s.status === 'SUMMARIZING',
      ),
    [sessions],
  );

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-transparent">
        <BookOpen className="w-16 h-16 text-amber-900/40 mb-4" />
        <h2 className="text-2xl font-semibold text-amber-200">
          El Códice está vacío
        </h2>
        <p className="text-gray-500 mt-2 max-w-md">
          Aún no se han registrado crónicas en esta aventura. El Cronista está
          esperando a que comience la próxima sesión.
        </p>
      </div>
    );
  }

  // Determine current status of selected session for the management card
  const currentStatus =
    selectedSession?.id === lastJsonMessage?.session_id
      ? wsStatus
      : selectedSession?.status || 'WAITING';

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl">
      <Header title="EL CÓDICE" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <SessionSidebar
          sessions={sessions}
          selectedSession={selectedSession}
          onSelectSession={setSelectedSession}
          isDM={isDM}
        />

        <main className="lg:col-span-3">
          {selectedSession && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {isDM && (
                <ChroniclerManagement
                  session={selectedSession}
                  statusMsg={currentStatus}
                  progress={
                    selectedSession?.id === lastJsonMessage?.session_id
                      ? progress
                      : selectedSession?.status === 'COMPLETED'
                        ? 100
                        : 0
                  }
                  readyState={readyState}
                  onStart={handleStartProcess}
                  onStop={handleStopProcess}
                  disabled={
                    anySessionProcessing &&
                    selectedSession?.status !== 'TRANSCRIBING' &&
                    selectedSession?.status !== 'SUMMARIZING'
                  }
                />
              )}

              <SessionSummary session={selectedSession} />

              {selectedSession.status === 'COMPLETED' && (
                <>
                  <HeroPath session={selectedSession} character={activeChar} />
                  <FullTranscript session={selectedSession} />
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
