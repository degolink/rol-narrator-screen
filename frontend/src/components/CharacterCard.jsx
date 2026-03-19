import React, { useState } from 'react';
import CoinUpdater from './CoinUpdater';
import api from '../api';

// D&D 5e modifier = floor((score - 10) / 2)
const mod = (score) => {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
};

// ─── Delete confirmation modal ────────────────────────────────────────────────
const DeleteModal = ({ name, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative bg-gray-800 border-2 border-red-700 rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 text-center">
      <p className="text-2xl mb-3">⚠️</p>
      <h3 className="text-lg font-bold text-red-400 mb-2">Eliminar personaje</h3>
      <p className="text-gray-300 text-sm mb-6">
        ¿Estás seguro de que quieres eliminar a{' '}
        <span className="text-yellow-300 font-bold">{name}</span>?
        Esta acción no se puede deshacer.
      </p>
      <div className="flex gap-3 justify-center">
        <button onClick={onCancel}
          className="flex-1 py-2 px-4 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors text-sm">
          Cancelar
        </button>
        <button onClick={onConfirm}
          className="flex-1 py-2 px-4 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold transition-colors text-sm">
          Eliminar
        </button>
      </div>
    </div>
  </div>
);

// ─── Attribute row with modifier ─────────────────────────────────────────────
const StatCell = ({ label, value }) => (
  <div className="flex flex-col items-center bg-gray-900 rounded-lg py-2 px-1">
    <span className="text-gray-500 font-bold text-xs tracking-widest">{label}</span>
    <span className="text-gray-100 font-bold text-base leading-tight">{value}</span>
    <span className="text-purple-400 text-xs">{mod(value)}</span>
  </div>
);

// ─── Main component ──────────────────────────────────────────────────────────
const CharacterCard = ({ character, onEdit, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`characters/${character.id}/`);
      onDelete(character.id);
    } catch (err) {
      // TODO: improve error handling
      console.error('Error deleting character', err);
    } finally {
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      {showDeleteModal && (
        <DeleteModal
          name={character.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      <div
        className="bg-gray-800 rounded-xl shadow-lg border-2 border-gray-600 transition-all hover:border-purple-500 w-full"
        style={{ boxShadow: "0 0 12px #000" }}
      >
        {/* ── Header ── */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-700 flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-yellow-300 truncate">
              {character.name}
              {character.nickname && (
                <span className="text-yellow-500 font-normal text-base ml-2">"{character.nickname}"</span>
              )}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Niv.{character.level} · <span className="text-purple-300">{character.char_class}</span>
              {character.race && <span className="text-gray-500"> · {character.race}</span>}
              <span className="ml-2 text-xs text-gray-600">{character.experience ?? 0} XP</span>
            </p>
            {character.alignment && (
              <p className="text-xs text-gray-500 italic mt-0.5">{character.alignment}</p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => onEdit(character)}
              title="Editar personaje"
              className="bg-gray-700 hover:bg-blue-800 text-gray-300 hover:text-white w-8 h-8 rounded flex items-center justify-center text-sm transition-colors"
            >✏️</button>
            <button
              onClick={() => setShowDeleteModal(true)}
              title="Eliminar personaje"
              className="bg-gray-700 hover:bg-red-700 text-gray-300 hover:text-white w-8 h-8 rounded flex items-center justify-center text-sm transition-colors"
            >🗑️</button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-5 py-4 space-y-4 text-sm text-gray-200">

          {/* HP + Energy */}
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs text-gray-500 uppercase">HP</span>
              <p>
                <span className="text-xl font-bold text-yellow-400" style={{ textShadow: "0 0 4px #ffc107" }}>
                  {character.hp}
                </span>
                <span className="text-gray-500 text-sm"> / {character.max_hp}</span>
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase">Energía</span>
              <p className="text-xl font-bold text-blue-400">{character.energy}</p>
            </div>
          </div>

          {/* Attributes grid with modifiers */}
          <div>
            <p className="text-xs text-yellow-300 font-bold uppercase tracking-wide mb-2">Atributos</p>
            <div className="grid grid-cols-3 gap-2">
              <StatCell label="FUE" value={character.strength} />
              <StatCell label="DES" value={character.dexterity} />
              <StatCell label="CON" value={character.constitution} />
              <StatCell label="INT" value={character.intelligence} />
              <StatCell label="SAB" value={character.wisdom} />
              <StatCell label="CAR" value={character.charisma} />
            </div>
          </div>

          {/* Coins */}
          <div className="border-t border-gray-700 pt-4">
            <p className="text-xs text-yellow-300 font-bold uppercase tracking-wide mb-3">Monedas</p>
            <div className="grid grid-cols-2 gap-2">
              <CoinUpdater characterId={character.id} type="copper" label="Cobre" amount={character.copper} onUpdate={c => onEdit && undefined} colorClass="text-[#b87333]" />
              <CoinUpdater characterId={character.id} type="silver" label="Plata" amount={character.silver} onUpdate={c => onEdit && undefined} colorClass="text-[#c0c0c0]" />
              <CoinUpdater characterId={character.id} type="gold" label="Oro" amount={character.gold} onUpdate={c => onEdit && undefined} colorClass="text-[#ffd700]" />
              <CoinUpdater characterId={character.id} type="platinum" label="Plat" amount={character.platinum} onUpdate={c => onEdit && undefined} colorClass="text-[#e5e4e2]" />
            </div>
          </div>

          {/* Historia / Motivaciones */}
          {(character.background_story || character.motivations) && (
            <div className="border-t border-gray-700 pt-4">
              <p className="text-xs text-yellow-300 font-bold uppercase tracking-wide mb-2">Historia</p>
              {character.background_story && (
                <p className="text-xs text-gray-400 italic mb-1">{character.background_story}</p>
              )}
              {character.motivations && (
                <p className="text-xs text-gray-400">
                  <span className="text-gray-300 font-semibold">Motivo: </span>
                  {character.motivations}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CharacterCard;
