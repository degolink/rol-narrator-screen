import { BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export function SessionSummary({ session }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-8">
        <Badge
          variant="outline"
          className="text-amber-500 border-amber-900/50 mb-2"
        >
          Session de Cronica:{' '}
          {new Date(session.date).toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Badge>
        <h2 className="text-3xl font-serif text-gray-100">
          Relato de la Aventura
        </h2>
      </div>

      {/* Global Summary Section */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4 text-amber-400">
          <BookOpen className="w-5 h-5" />
          <h3 className="font-bold tracking-tight text-lg">
            Resumen de la Sesión
          </h3>
        </div>
        <Card className="bg-[#121214] border-gray-800/50 shadow-2xl">
          <CardContent className="pt-6">
            <div className="prose prose-invert max-w-none prose-amber prose-p:text-gray-300 prose-p:leading-relaxed text-lg">
              {session.summary ? (
                <div className="whitespace-pre-wrap">{session.summary}</div>
              ) : (
                <div className="text-gray-500 italic py-8 text-center bg-black/20 rounded border border-dashed border-gray-800">
                  La narrativa está siendo tejida por el Cronista... vuelve
                  pronto.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
