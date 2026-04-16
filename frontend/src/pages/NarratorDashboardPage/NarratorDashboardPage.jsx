import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '../../components/Header';
import { useCharacters } from '../../hooks/characters/useCharacters';
import { NarratorCharacterCard } from './NarratorCharacterCard/NarratorCharacterCard';
import { DeleteCharacterDialog } from './NarratorCharacterCard/DeleteCharacterDialog';

export function NarratorDashboardPage() {
  const navigate = useNavigate();
  const [characterToDelete, setCharacterToDelete] = useState();
  const { loading, characters } = useCharacters();

  const openCreate = useCallback(() => {
    navigate('/personaje/nuevo');
  }, [navigate]);

  const openEdit = useCallback(
    (character) => {
      navigate(`/personaje/${character.id}`);
    },
    [navigate],
  );

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p
          className="text-yellow-300 text-sm animate-pulse tracking-widest"
          style={{ fontFamily: "'Press Start 2P', cursive" }}
        >
          Cargando personajes...
        </p>
      </div>
    );

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
      <Header
        title="Pantalla del Narrador"
        description="Gestiona tus héroes y villanos, sigue sus estadísticas y mantén el control de la narrativa en tus sesiones."
      />

      {/* Main Actions */}
      <div className="flex justify-center mb-10">
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-5 w-5" /> Nuevo Personaje
        </Button>
      </div>

      {/* Character Cards Grid */}
      <div className="mt-6">
        {characters.length === 0 ? (
          <div className="text-center py-24 bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-700">
            <p className="text-gray-400 mb-2">
              No hay personajes creados todavía.
            </p>
            <p className="text-gray-500 text-xs text-balance">
              Comienza creando uno nuevo para tu campaña.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Main Characters Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-200 mb-6 border-b border-gray-800 pb-2">
                Personajes Principales
              </h2>
              {characters.filter((c) => !c.npc).length === 0 ? (
                <p className="text-gray-500 text-sm italic">
                  No hay personajes principales registrados.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {characters
                    .filter((c) => !c.npc)
                    .map((char) => (
                      <NarratorCharacterCard
                        key={char.id}
                        character={char}
                        onEdit={openEdit}
                        setCharacterToDelete={setCharacterToDelete}
                      />
                    ))}
                </div>
              )}
            </div>

            {/* NPCs Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-200 mb-6 border-b border-gray-800 pb-2">
                Personajes No Jugadores (NPCs)
              </h2>
              {characters.filter((c) => c.npc).length === 0 ? (
                <p className="text-gray-500 text-sm italic">
                  No hay NPCs registrados.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 opacity-90">
                  {characters
                    .filter((c) => c.npc)
                    .map((char) => (
                      <NarratorCharacterCard
                        key={char.id}
                        character={char}
                        onEdit={openEdit}
                        setCharacterToDelete={setCharacterToDelete}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {!!characterToDelete && (
        <DeleteCharacterDialog
          open={!!characterToDelete}
          character={characterToDelete}
          setCharacterToDelete={setCharacterToDelete}
        />
      )}
    </div>
  );
}
