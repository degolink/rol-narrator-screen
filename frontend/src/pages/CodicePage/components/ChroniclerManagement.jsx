import { Timer, Square, Play } from 'lucide-react';
import { ReadyState } from 'react-use-websocket';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const STATUS_LABELS = {
  WAITING: 'Esperando',
  TRANSCRIBING: 'Transcribiendo...',
  SUMMARIZING: 'Resumiendo...',
  PAUSED: 'Pausado',
  COMPLETED: 'Completado',
};

export function ChroniclerManagement({
  progress,
  statusMsg,
  readyState,
  onStop,
  onStart,
  session,
  disabled,
}) {
  if (!session) return null;

  const isTranscribing =
    statusMsg === 'TRANSCRIBING' || statusMsg === 'SUMMARIZING';
  const displayStartButton =
    statusMsg !== 'TRANSCRIBING' && statusMsg !== 'SUMMARIZING';
  const statusLabel = STATUS_LABELS[statusMsg] || statusMsg;

  return (
    <Card className="border-amber-900/30 bg-[#121214] mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-amber-100 flex items-center gap-2 text-lg">
            <Timer className="w-5 h-5 text-amber-500" /> Control del Cronista
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge
              variant={statusMsg === 'COMPLETED' ? 'success' : 'outline'}
              className="capitalize"
            >
              {statusLabel}
            </Badge>
            <span
              className={`w-2 h-2 rounded-full ${readyState === ReadyState.OPEN ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}
              title={
                readyState === ReadyState.OPEN ? 'Conectado' : 'Desconectado'
              }
            />
          </div>
        </div>
        <CardDescription>
          Gestiona el procesamiento de esta crónica.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isTranscribing && (
            <div className="space-y-2">
              <div className="relative h-2 w-full bg-gray-800 rounded-full overflow-hidden border border-gray-700/50 shadow-inner">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 tabular-nums">
                <span>{progress}% completado</span>
                <span>Procesando audio...</span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {displayStartButton ? (
              <Button
                onClick={() => onStart(session.id)}
                disabled={disabled}
                className="bg-amber-600 hover:bg-amber-700 text-white h-9 px-4 disabled:opacity-50 disabled:bg-gray-800"
              >
                <Play className="w-4 h-4 mr-2 fill-current" />
                {statusMsg === 'COMPLETED'
                  ? 'Reprocesar Sesión'
                  : 'Iniciar Procesamiento'}
              </Button>
            ) : (
              <Button
                onClick={() => onStop(session.id)}
                variant="outline"
                className="border-red-900/50 text-red-500 hover:bg-red-950/20 h-9 px-4"
              >
                <Square className="w-4 h-4 mr-2 fill-current" /> Detener Proceso
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
