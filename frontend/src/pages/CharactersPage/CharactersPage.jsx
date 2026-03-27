import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiService } from '../../services/apiService';
import { useCharactersListSync } from '../../hooks/characters/useCharactersListSync';
import { useAuth } from '../../context/AuthContext';
import { CharacterCardsSection } from './CharacterCardsSection';

export function CharactersPage() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const { characters, setCharacters } = useCharactersListSync([]);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await apiService.get('characters/?visible=true');
        setCharacters(response.data);
      } catch (err) {
        console.error('Error fetching characters:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCharacters();
  }, [setCharacters]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  const myCharacters = characters.filter((c) => c.player === user?.id && !c.npc);
  const otherPublicCharacters = characters.filter((c) => c.player !== user?.id && !c.npc);
  const npcs = characters.filter((c) => c.npc);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

      {/* Header with Create Button */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-[#2d2d35] pb-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">Códice de Personajes</h1>
          <p className="text-gray-500 mt-2">Explora los héroes y entidades de este mundo.</p>
        </div>
        <Button
          onClick={() => navigate('/narrador')}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-6 rounded-2xl shadow-xl shadow-blue-600/20"
        >
          <Plus className="w-5 h-5 mr-2" />
          Crear Nuevo Personaje
        </Button>
      </div>

      <div className="space-y-16">
        <CharacterCardsSection
          title="Mis Personajes"
          characters={myCharacters}
          variant="mine"
          isMine
        />

        <CharacterCardsSection
          title="Héroes del Reino"
          characters={otherPublicCharacters}
          emptyMessage="No hay otros héroes públicos actualmente."
        />

        <CharacterCardsSection
          title="Habitantes y Entidades"
          characters={npcs}
          variant="npc"
        />
      </div>

    </div>
  );
}
