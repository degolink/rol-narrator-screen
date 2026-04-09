import React, { useMemo } from 'react';
import { Map } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function HeroPath({ session, character }) {
  const fragments = useMemo(() => {
    if (!session || !character || !session.fragments) return [];
    return session.fragments.filter((f) => f.character === character.id);
  }, [session, character]);

  if (!character) return null;

  return (
    <section className="animate-in zoom-in-95 duration-1000 delay-300">
      <div className="flex items-center gap-2 mb-4 text-orange-400">
        <Map className="w-5 h-5" />
        <h3 className="font-bold tracking-tight text-lg">
          La Senda de {character.name}
        </h3>
      </div>
      <Card className="bg-gradient-to-br from-[#1a1a1c] to-[#121214] border-orange-900/30">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {fragments?.length > 0 ? (
              fragments.map((f, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="text-xs font-mono text-orange-900 w-12 pt-1">
                    {Math.floor(f.timestamp / 60)}:
                    {(f.timestamp % 60).toFixed(0).padStart(2, '0')}
                  </div>
                  <div className="flex-1 pb-4 border-l border-orange-900/20 pl-4 group-last:border-transparent">
                    <p className="text-gray-200 group-hover:text-orange-100 transition-colors">
                      {f.text}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic text-center py-4 bg-black/10 rounded">
                Tu personaje apenas ha susurrado en esta crónica.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
