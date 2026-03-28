import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { CharacterCard } from './CharacterCard/CharacterCard';

export function CharacterCardsSection({
  title,
  characters,
  variant = 'public',
  emptyMessage,
  isMine = false,
}) {
  const navigate = useNavigate();
  const handleNavigate = useCallback(
    (id) => {
      navigate(`/personaje/${id}`);
    },
    [navigate],
  );

  if (characters.length === 0 && !emptyMessage) return null;

  const configs = {
    mine: {
      title:
        'text-2xl font-black text-blue-500 uppercase tracking-tighter italic border-l-4 border-blue-500 pl-4',
    },
    public: {
      title:
        'text-xl font-bold text-gray-400 uppercase tracking-widest border-b border-[#2d2d35] pb-2',
    },
    npc: {
      title:
        'text-xl font-bold text-gray-500 uppercase tracking-widest border-b border-[#2d2d35] pb-2',
      section: 'opacity-70 hover:opacity-100 transition-opacity',
    },
  };

  const config = configs[variant] || configs.public;

  return (
    <section className={cn('space-y-6', config.section)}>
      <h2 className={config.title}>{title}</h2>
      {characters.length === 0 ? (
        <div className="text-center py-12 bg-[#16161a] rounded-2xl border border-dashed border-[#2d2d35]">
          <p className="text-gray-500 italic">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {characters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              isMine={isMine}
              onClick={handleNavigate}
            />
          ))}
        </div>
      )}
    </section>
  );
}
