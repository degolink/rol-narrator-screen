import { History } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function SessionSidebar({ sessions, selectedSession, onSelectSession, isDM }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'WAITING': return <span className="w-2 h-2 rounded-full bg-gray-500" title="Pendiente" />;
      case 'TRANSCRIBING':
      case 'SUMMARIZING': return <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Procesando" />;
      case 'PAUSED': return <span className="w-2 h-2 rounded-full bg-red-500" title="Detenido" />;
      case 'COMPLETED': return null;
      default: return null;
    }
  };

  return (
    <aside className="lg:col-span-1 border-r border-gray-800/50 pr-4">
      <h3 className="text-sm font-bold text-gray-500 mb-4 px-2 tracking-tighter uppercase flex items-center gap-2">
        <History className="w-4 h-4" /> Sesiones Pasadas
      </h3>
      <ScrollArea className="h-[70vh]">
        <div className="space-y-2">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectSession(s)}
              className={`w-full text-left p-4 rounded-lg transition-all border group relative ${
                selectedSession?.id === s.id
                  ? 'bg-amber-950/20 border-amber-800/50 text-amber-200 shadow-lg shadow-black/50'
                  : 'border-transparent text-gray-500 hover:bg-white/5 hover:text-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="block text-xs opacity-50">
                  {new Date(s.date).toLocaleDateString('es-ES')}
                </span>
                {isDM && getStatusBadge(s.status)}
              </div>
              <span className="font-serif block truncate text-sm">
                {s.title || (s.summary?.trim().split('\n')[0]) || 'Sesión sin título'}
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
