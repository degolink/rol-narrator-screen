import { MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export function FullTranscript({ session }) {
  return (
    <section className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4 text-gray-400">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <h3 className="font-bold tracking-tight text-lg uppercase text-xs">
            Transcripción Completa
          </h3>
        </div>
      </div>

      <Card className="bg-black/40 border-gray-800">
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="divide-y divide-gray-800/30">
              {session.fragments?.map((f, i) => (
                <div
                  key={i}
                  className="p-4 flex gap-4 hover:bg-white/5 transition-colors"
                >
                  <div className="w-16 text-xs font-mono text-gray-600 shrink-0">
                    {Math.floor(f.timestamp / 60)}:
                    {(f.timestamp % 60).toFixed(0).padStart(2, '0')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${f.is_dm ? 'bg-amber-900/40 text-amber-500' : 'bg-blue-900/40 text-blue-400'}`}
                      >
                        {f.character_name || (f.is_dm ? 'DM' : 'Desconocido')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 italic">"{f.text}"</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </section>
  );
}
