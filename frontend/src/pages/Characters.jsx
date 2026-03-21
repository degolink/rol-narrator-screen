import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { Card, CardContent } from "@/components/ui/card";

export function Characters() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await apiService.get('characters/');
        // Only public characters
        setCharacters(response.data.filter(c => c.visible));
      } catch (err) {
        console.error("Error fetching characters:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCharacters();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="text-yellow-300 text-sm animate-pulse tracking-widest" style={{ fontFamily: "'Press Start 2P', cursive" }}>
        Cargando personajes...
      </p>
    </div>
  );

  const mainCharacters = characters.filter(c => !c.npc);
  const npcs = characters.filter(c => c.npc);

  const renderCard = (char) => (
    <Card 
      key={char.id} 
      className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-purple-900/20"
      onClick={() => navigate(`/personaje/${char.id}`)}
    >
      <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 w-full">
          <div className="flex flex-wrap items-baseline gap-2">
            <h3 className="text-lg font-bold text-yellow-300">{char.name}</h3>
            {char.nickname && (
              <span className="text-sm text-gray-400 italic">"{char.nickname}"</span>
            )}
          </div>
          {(char.char_class || char.race) && (
            <p className="text-sm text-gray-400 mt-1">
              {char.char_class}{char.secondary_class ? ` / ${char.secondary_class}` : ''}
              {char.char_class && char.race && <span className="mx-2 text-gray-600">·</span>}
              {char.race}
            </p>
          )}
          <div className="mt-3 flex items-center gap-2 max-w-[200px]">
            <div className="h-1 flex-1 bg-gray-950 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600" style={{ width: `${Math.min(100, ((char.experience || 0) / 355000) * 100)}%` }}></div>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">{char.experience || 0} XP</span>
          </div>
        </div>
        <div className="bg-gray-900 px-4 py-2 rounded-lg border border-gray-700/50 text-center min-w-[4rem] shrink-0">
          <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">Niv</span>
          <span className="block text-xl font-bold text-gray-100 leading-none">{char.level}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-yellow-300 mb-4" style={{ fontFamily: "'Press Start 2P', cursive", textShadow: "0 0 12px rgba(255, 204, 0, 0.4)" }}>
          Códice de Personajes
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">Explora los héroes y entidades de este mundo.</p>
      </div>
      
      <div className="space-y-12">
        {/* Main Characters Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-200 mb-6 border-b border-gray-800 pb-2">Héroes Principales</h2>
          {mainCharacters.length === 0 ? (
            <p className="text-gray-500 text-sm italic text-center py-8">No hay héroes públicos actualmente.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {mainCharacters.map(renderCard)}
            </div>
          )}
        </div>

        {/* NPCs Section */}
        {npcs.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-200 mb-6 border-b border-gray-800 pb-2">Habitantes y Entidades (NPCs)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {npcs.map(renderCard)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
