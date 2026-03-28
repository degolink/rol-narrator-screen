import React from 'react';
import { useParams } from 'react-router-dom';
import { CharacterForm } from '../components/CharacterForm';
import { useCharacter } from '../hooks/characters/useCharacter';
import { LoadingScreen } from '../components/LoadingScreen';

export function CharacterDetailsPage() {
  const { id } = useParams();
  const { loading, character } = useCharacter(id);

  if (loading) {
    return <LoadingScreen message="Cargando detalles..." />;
  }

  if (!character) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 border-b border-gray-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-yellow-300">
          {character.name}
        </h1>
        <p className="text-gray-400 text-sm mt-1">Hoja de Personaje</p>
      </div>

      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4 sm:p-6">
        <CharacterForm character={character} />
      </div>
    </div>
  );
}
