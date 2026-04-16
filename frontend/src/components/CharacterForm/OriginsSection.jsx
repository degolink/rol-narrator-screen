import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { srdService } from '../../services/srdService';
import { SRDDetailModal } from '../SRDDetailModal';

export function OriginsSection({ formData, errors, onUpdateField }) {
  const [srdData, setSrdData] = useState({
    classes: [],
    races: [],
    alignments: [],
  });

  const [detailConfig, setDetailConfig] = useState(null);

  useEffect(() => {
    const fetchSrd = async () => {
      try {
        const [classes, races, alignments] = await Promise.all([
          srdService.getClasses(),
          srdService.getRaces(),
          srdService.getAlignments(),
        ]);
        setSrdData({ classes, races, alignments });
      } catch (err) {
        console.error('Error fetching SRD data:', err);
      }
    };
    fetchSrd();
  }, []);

  const openDetails = (type, index) => {
    if (!index || index === 'none') return;
    setDetailConfig({ type, index });
  };

  const renderLabel = (text, type, value, required = false) => (
    <div className="flex items-center justify-between">
      <Label className="text-[10px] text-gray-500 uppercase font-black">
        {text} {required && '*'}
      </Label>
      {value && value !== 'none' && (
        <button
          type="button"
          onClick={() => openDetails(type, value)}
          className="text-gray-500 hover:text-yellow-400 transition-colors p-1 -m-1"
          title="Ver detalles"
        >
          <Info className="w-3 h-3" />
        </button>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="space-y-1.5">
        {renderLabel('Clase Principal', 'class', formData.char_class, !formData.npc)}
        <Select
          value={formData.char_class || ''}
          onValueChange={(val) => onUpdateField('char_class', val)}
        >
          <SelectTrigger
            className={`w-full bg-gray-950 border-gray-800 ${errors.char_class ? 'border-red-500' : ''}`}
          >
            <SelectValue placeholder="Seleccionar" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-800 text-gray-100">
            {srdData.classes.map((c) => (
              <SelectItem key={c.index} value={c.index}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.char_class && (
          <p className="text-[10px] text-red-400">{errors.char_class}</p>
        )}
      </div>

      <div className="space-y-1.5">
        {renderLabel('Clase Secundaria', 'class', formData.secondary_class)}
        <Select
          value={formData.secondary_class || 'none'}
          onValueChange={(val) =>
            onUpdateField('secondary_class', val === 'none' ? '' : val)
          }
        >
          <SelectTrigger className="w-full bg-gray-950 border-gray-800">
            <SelectValue placeholder="Opcional" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-800 text-gray-100">
            <SelectItem value="none">Ninguna</SelectItem>
            {srdData.classes.map((c) => (
              <SelectItem key={c.index} value={c.index}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        {renderLabel('Raza', 'race', formData.race, !formData.npc)}
        <Select
          value={formData.race || ''}
          onValueChange={(val) => onUpdateField('race', val)}
        >
          <SelectTrigger
            className={`w-full bg-gray-950 border-gray-800 ${errors.race ? 'border-red-500' : ''}`}
          >
            <SelectValue placeholder="Seleccionar" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-800 text-gray-100">
            {srdData.races.map((r) => (
              <SelectItem key={r.index} value={r.index}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.race && (
          <p className="text-[10px] text-red-400">{errors.race}</p>
        )}
      </div>

      <div className="space-y-1.5">
        {renderLabel('Alineamiento Moral', 'alignment', formData.alignment, !formData.npc)}
        <Select
          value={formData.alignment || ''}
          onValueChange={(val) => onUpdateField('alignment', val)}
        >
          <SelectTrigger
            className={`w-full bg-gray-950 border-gray-800 ${errors.alignment ? 'border-red-500' : ''}`}
          >
            <SelectValue placeholder="Seleccionar" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-800 text-gray-100">
            {srdData.alignments.map((a) => (
              <SelectItem key={a.index} value={a.index}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.alignment && (
          <p className="text-[10px] text-red-400">{errors.alignment}</p>
        )}
      </div>

      {detailConfig && (
        <SRDDetailModal
          isOpen={!!detailConfig}
          onClose={() => setDetailConfig(null)}
          type={detailConfig.type}
          index={detailConfig.index}
        />
      )}
    </div>
  );
}
