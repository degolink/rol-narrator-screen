import React, { useEffect, useState } from 'react';
import api from '../api';
import CharacterCard from './CharacterCard';
import CharacterForm from './CharacterForm';

const NarratorDashboard = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  // drawerMode: null | 'create' | 'edit'
  const [drawerMode, setDrawerMode] = useState(null);
  const [editingCharacter, setEditingCharacter] = useState(null);

  const fetchCharacters = async () => {
    try {
      const response = await api.get('characters/');
      setCharacters(response.data);
    } catch (err) {
      // TODO: improve error handling
      console.error("Error fetching characters:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCharacters(); }, []);

  const openCreate = () => {
    setEditingCharacter(null);
    setDrawerMode('create');
  };

  const openEdit = (character) => {
    setEditingCharacter(character);
    setDrawerMode('edit');
  };

  const closeDrawer = () => {
    setDrawerMode(null);
    setEditingCharacter(null);
  };

  const handleSaved = (savedChar) => {
    if (drawerMode === 'create') {
      setCharacters(prev => [savedChar, ...prev]);
    } else {
      setCharacters(prev => prev.map(c => c.id === savedChar.id ? savedChar : c));
    }
    closeDrawer();
  };

  const handleDeleted = (id) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-yellow-300 text-sm animate-pulse">Cargando personajes...</p>
    </div>
  );

  const drawerOpen = drawerMode !== null;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 w-full">
      {/* Header */}
      <header className="mb-6 text-center">
        <h1
          className="text-2xl md:text-4xl font-bold text-yellow-300 mt-6 mb-4"
          style={{ fontFamily: "'Press Start 2P', cursive", textShadow: "0 0 8px #ffcc00" }}
        >
          Pantalla del Narrador
        </h1>
      </header>

      {/* Character Cards */}
      <div className="max-w-7xl mx-auto">
        {characters.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-6">No hay personajes creados.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
            {characters.map(char => (
              <CharacterCard
                key={char.id}
                character={char}
                onEdit={openEdit}
                onDelete={handleDeleted}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add button */}
      <div className="flex justify-center mt-8 mb-4">
        <button
          onClick={openCreate}
          className="bg-purple-900 hover:bg-purple-700 active:scale-95 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg shadow-purple-900/40 text-sm"
        >
          ＋ Nuevo Personaje
        </button>
      </div>

      {/* Shared drawer — create or edit */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeDrawer} />

          {/* Panel */}
          <div className="relative ml-auto w-full max-w-md sm:max-w-lg h-full bg-gray-900 border-l border-gray-700 shadow-2xl overflow-y-auto flex flex-col animate-slide-in">
            {/* Drawer header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
              <h2 className="text-yellow-300 font-bold text-base" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                {drawerMode === 'edit' ? 'Editar personaje' : 'Crear personaje'}
              </h2>
              <button
                onClick={closeDrawer}
                className="text-gray-400 hover:text-white transition-colors text-xl leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-gray-700"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 p-4">
              <CharacterForm
                key={editingCharacter?.id ?? 'new'}
                character={editingCharacter}
                onSaved={handleSaved}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NarratorDashboard;
