import { CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export function SessionListCard({ sessions, onSelectSession }) {
  return (
    <Card className="border-gray-800 bg-[#121214]">
      <CardHeader>
        <CardTitle className="text-gray-200">Sesiones Recientes</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-1">
            {sessions.length === 0 && (
              <p className="p-4 text-center text-gray-500">
                No hay sesiones aún.
              </p>
            )}
            {sessions.map((s) => (
              <div
                key={s.id}
                className="p-4 hover:bg-white/5 border-b border-gray-800 transition-colors cursor-pointer group"
                onClick={() => onSelectSession(s)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-200">
                      {new Date(s.date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {s.audio_files.length} fragmentos de audio
                    </div>
                  </div>
                  {s.status === 'Completado' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Badge variant="outline" className="text-[10px] px-1 h-4">
                      {s.status}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
