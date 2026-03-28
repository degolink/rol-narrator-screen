import React, { useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '../../../context/UserContext';
import { VisibilityBadge } from './VisibilityBadge';

export function CharacterCard({ character, isMine = false, onClick }) {
  const { isDungeonMaster } = useUser();

  const handleClick = useCallback(() => {
    if (onClick) onClick(character.id);
  }, [onClick, character.id]);

  return (
    <Card
      key={character.id}
      className={`bg-[#16161a] border-[#2d2d35] hover:border-blue-500/50 transition-all duration-300 cursor-pointer shadow-lg ${isMine ? 'ring-2 ring-blue-500/20' : ''}`}
      onClick={handleClick}
    >
      <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 w-full">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-white leading-tight">
              {character.name}
            </h3>
            {character.nickname && (
              <span className="text-sm text-gray-500 italic">
                "{character.nickname}"
              </span>
            )}
            <VisibilityBadge
              visible={character.visible}
              isDungeonMaster={isDungeonMaster}
            />
          </div>
          {(character.char_class || character.race) && (
            <p className="text-sm text-gray-500 mt-1 uppercase tracking-widest font-medium">
              {character.char_class}{' '}
              {character.race ? `· ${character.race}` : ''}
            </p>
          )}
          <div className="mt-3 flex items-center justify-between gap-2 max-w-[280px]">
            <div className="flex items-center gap-2 flex-1">
              <div className="h-1 flex-1 bg-gray-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600"
                  style={{
                    width: `${Math.min(100, ((character.experience || 0) / 355000) * 100)}%`,
                  }}
                ></div>
              </div>
              <span className="text-[10px] text-gray-600 font-mono">
                {character.experience || 0} XP
              </span>
            </div>
          </div>
        </div>
        <div className="bg-[#1e1e24] px-4 py-2 rounded-lg border border-[#2d2d35] text-center min-w-[4rem] shrink-0">
          <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">
            Niv
          </span>
          <span className="block text-xl font-bold text-white leading-none">
            {character.level}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
