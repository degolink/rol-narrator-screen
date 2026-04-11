import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { api } from '@/services/apiService';
import { Header } from '@/components/Header';
import { SessionSidebar } from './components/SessionSidebar';
import { SessionSummary } from './components/SessionSummary';
import { HeroPath } from './components/HeroPath';
import { FullTranscript } from './components/FullTranscript';

export function CodicePage() {
  const { user } = useUser();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const activeChar = user?.profile?.active_character;

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await api.get('/cronista/');
        setSessions(response.data);
        setSelectedSession(response?.data?.[0] ?? null);
      } catch (err) {
        console.error('Error fetching sessions', err);
      }
    };
    fetchSessions();
  }, []);

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

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl">
      <Header title="EL CÓDICE" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <SessionSidebar
          sessions={sessions}
          selectedSession={selectedSession}
          onSelectSession={setSelectedSession}
        />

        <main className="lg:col-span-3">
          {selectedSession && (
            <div className="space-y-8">
              <SessionSummary session={selectedSession} />

              <HeroPath session={selectedSession} character={activeChar} />

              <FullTranscript session={selectedSession} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
