import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { CharacterForm } from '../components/CharacterForm';

export function CharacterDetail() {
  const { id } = useParams();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const response = await apiService.get(`characters/${id}/`);
        setCharacter(response.data);
      } catch (err) {
        console.error("Error fetching character:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCharacter();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <p className="text-yellow-300 text-sm animate-pulse tracking-widest" style={{ fontFamily: "'Press Start 2P', cursive" }}>
        Cargando detalles...
      </p>
    </div>
  );

  if (!character) return (
    <div className="text-center py-24 text-red-400">
      Error: Personaje no encontrado
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 border-b border-gray-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-yellow-300">
          {character.name}
        </h1>
        <p className="text-gray-400 text-sm mt-1">Hoja de Personaje</p>
      </div>

      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4 sm:p-6">
        <CharacterForm
          character={character}
          isMaster={false}
          onSaved={(updatedChar) => setCharacter(updatedChar)}
        />
      </div>
    </div>
  );
}
