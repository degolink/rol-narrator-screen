import { History } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function SessionSidebar({ sessions, selectedSession, onSelectSession }) {
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
              className={`w-full text-left p-4 rounded-lg transition-all border ${
                selectedSession?.id === s.id
                  ? 'bg-amber-950/20 border-amber-800/50 text-amber-200 shadow-lg shadow-black/50'
                  : 'border-transparent text-gray-500 hover:bg-white/5 hover:text-gray-300'
              }`}
            >
              <span className="block text-xs opacity-50 mb-1">
                {new Date(s.date).toLocaleDateString('es-ES')}
              </span>
              <span className="font-serif block truncate">
                {s.summary?.trim().split('\n')[0] || 'Sesión sin título'}
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
