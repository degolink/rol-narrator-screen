import React, { useEffect, useState, useCallback } from 'react';
import { dequal } from 'dequal';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CharactersDrawer } from './CharactersDrawer';
import { Header } from '../../components/Header';
import { useCharacters } from '../../hooks/characters/useCharacters';
import { NarratorCharacterCard } from './NarratorCharacterCard/NarratorCharacterCard';
import { DeleteCharacterDialog } from './NarratorCharacterCard/DeleteCharacterDialog';

export function NarratorDashboard() {
  // drawerMode: null | 'create' | 'edit'
  const [drawerMode, setDrawerMode] = useState(null);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [characterToDelete, setCharacterToDelete] = useState();
  const { loading, characters } = useCharacters();
  const drawerOpen = drawerMode !== null;

  const openCreate = useCallback(() => {
    setEditingCharacter(null);
    setDrawerMode('create');
  }, []);

  const openEdit = useCallback((character) => {
    setEditingCharacter(character);
    setDrawerMode('edit');
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerMode(null);
    setEditingCharacter(null);
  }, []);

  // Keep editingCharacter in sync with the characters list (for real-time updates)
  useEffect(() => {
    if (!editingCharacter) return;

    const updated = characters.find((c) => c.id === editingCharacter.id);
    if (updated && !dequal(updated, editingCharacter)) {
      setEditingCharacter(updated);
    }
  }, [characters, editingCharacter]);

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
        <Button
          onClick={openCreate}
          className="bg-purple-900 hover:bg-purple-700 text-white"
        >
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

      {/* Shared drawer — create or edit */}
      <CharactersDrawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        mode={drawerMode}
        character={editingCharacter}
      />

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
