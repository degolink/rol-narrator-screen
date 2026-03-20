import React, { useState } from 'react';
import apiService from '../services/apiService';
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

const CoinUpdater = ({ characterId, type, label, amount, onUpdate, colorClass }) => {
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (delta) => {
    const newValue = Math.max(0, amount + delta);
    setLoading(true);
    try {
      const response = await apiService.post(`characters/${characterId}/coin/`, {
        type: type,
        value: newValue
      });
      onUpdate(response.data);
    } catch (err) {
      console.error('Error updating coin', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between bg-gray-900/60 p-1.5 px-2 rounded-lg border border-gray-800">
      <span className={`text-[10px] font-black uppercase tracking-tighter w-12 ${colorClass}`}>{label}</span>

      <div className="flex items-center gap-1.5">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => handleUpdate(-1)}
          disabled={loading || amount <= 0}
          className="h-6 w-6 rounded-md bg-gray-800 hover:bg-red-900/30 hover:text-red-400 border-none transition-all active:scale-90"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="min-w-[20px] text-center font-mono text-xs font-bold text-gray-200 leading-none">{amount}</span>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => handleUpdate(1)}
          disabled={loading}
          className="h-6 w-6 rounded-md bg-gray-800 hover:bg-green-900/30 hover:text-green-400 border-none transition-all active:scale-90"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default CoinUpdater;
