import { FileText, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function SessionDetailsCard({ session, onStartProcess }) {
  if (!session) return null;

  return (
    <Card className="mt-6 border-amber-900/20 bg-[#0c0c0e]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-500" />
          Resumen de la Sesión:{' '}
          {new Date(session.date).toLocaleDateString('es-ES')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-invert max-w-none">
          {session.summary ? (
            <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
              {session.summary}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500 bg-black/20 rounded-lg border border-dashed border-gray-800">
              <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
              <p>Aún no hay un resumen generado para esta sesión.</p>
              {session.status === 'Esperando' && (
                <Button
                  variant="link"
                  className="text-amber-500 mt-2"
                  onClick={() => onStartProcess(session.id)}
                >
                  Procesar ahora
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
