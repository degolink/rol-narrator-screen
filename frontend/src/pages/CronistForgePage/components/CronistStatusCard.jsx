import { Timer, FastForward, Play } from 'lucide-react';
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

export function CronistStatusCard({
  progress,
  statusMsg,
  statusLabel,
  readyState,
  onPostpone,
  onStart,
  sessionId,
}) {
  const isPostponeDisabled =
    !sessionId ||
    statusMsg === 'WAITING' ||
    statusMsg === 'COMPLETED' ||
    statusMsg === 'PAUSED';

  const displayStartButton = statusMsg === 'WAITING' && sessionId;

  return (
    <Card className="md:col-span-2 border-amber-900/30 bg-[#121214]">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-amber-100 flex items-center gap-2">
            <Timer className="w-5 h-5" /> Estado del Cronista
          </CardTitle>
          <Badge variant={progress === 100 ? 'success' : 'outline'}>
            {statusLabel}
          </Badge>
        </div>
        <CardDescription>
          Supervisión en tiempo real del procesamiento de audio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="relative h-4 w-full bg-gray-800 rounded-full overflow-hidden border border-gray-700 shadow-inner">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>{progress}% completado</span>
            <span>
              {readyState === ReadyState.OPEN ? 'Conectado' : 'Reconectando...'}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => onPostpone(sessionId)}
              disabled={isPostponeDisabled}
              variant="outline"
              className="border-amber-700 text-amber-500 hover:bg-amber-950/30"
            >
              <FastForward className="w-4 h-4 mr-2" /> Posponer 2 horas
            </Button>

            {displayStartButton && (
              <Button
                onClick={() => onStart(sessionId)}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" /> Iniciar Procesamiento
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
