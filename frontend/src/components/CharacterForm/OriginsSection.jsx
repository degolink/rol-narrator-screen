import React, { useState, useEffect } from 'react';
import { SRDLabel } from '../srd/SRDLabel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { srdService } from '../../services/srdService';

export function OriginsSection({ formData, errors, onUpdateField }) {
  const [srdData, setSrdData] = useState({
    classes: [],
    races: [],
    alignments: [],
  });

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="space-y-1.5">
        <SRDLabel
          text="Clase Principal"
          type="class"
          value={formData.char_class}
          required={!formData.npc}
        />
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
        <SRDLabel
          text="Clase Secundaria"
          type="class"
          value={formData.secondary_class}
        />
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
        <SRDLabel
          text="Raza"
          type="race"
          value={formData.race}
          required={!formData.npc}
        />
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
        <SRDLabel
          text="Alineamiento Moral"
          type="alignment"
          value={formData.alignment}
          required={!formData.npc}
        />
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
    </div>
  );
}
