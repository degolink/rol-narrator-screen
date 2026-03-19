import React, { useState } from 'react';
import api from '../api';

const CoinUpdater = ({ characterId, type, label, amount, onUpdate, colorClass }) => {
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (delta) => {
    const newValue = Math.max(0, amount + delta);
    setLoading(true);
    try {
      const response = await api.post(`characters/${characterId}/coin/`, {
        type: type,
        value: newValue
      });
      onUpdate(response.data);
    } catch (err) {
      // TODO: improve error handling
      console.error('Error updating coin', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between bg-gray-900 p-2 rounded">
      <span className={`text-sm font-bold w-16 ${colorClass}`}>{label}:</span>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleUpdate(-1)}
          disabled={loading || amount <= 0}
          className="bg-gray-700 hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white w-6 h-6 rounded flex items-center justify-center transition-colors"
        >
          -
        </button>
        <span className="min-w-[24px] text-center font-mono leading-none">{amount}</span>
        <button
          onClick={() => handleUpdate(1)}
          disabled={loading}
          className="bg-gray-700 hover:bg-purple-800 disabled:opacity-50 text-white w-6 h-6 rounded flex items-center justify-center transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default CoinUpdater;
