import React from 'react';
import { Info } from 'lucide-react';
import { Label } from '@/components/ui/label';

export function SRDLabel({
  text,
  type,
  value,
  required = false,
  onOpenDetails,
}) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-[10px] text-gray-500 uppercase font-black">
        {text} {required && '*'}
      </Label>
      {value && value !== 'none' && (
        <button
          type="button"
          onClick={() => onOpenDetails(type, value)}
          className="text-gray-500 hover:text-yellow-400 transition-colors p-1 -m-1"
          title="Ver detalles"
        >
          <Info className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
