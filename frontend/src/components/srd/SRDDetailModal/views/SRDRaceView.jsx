import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Footprints,
  Scale,
  Zap,
  Scroll as ScrollIcon,
  Languages,
  BookOpen,
  Dna,
} from 'lucide-react';
import { srdService } from '../../../../services/srdService';
import { DataItem, TagList, SRDLoader } from '../SRDCommon';

export default function SRDRaceView({ index }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result = await srdService.getRace(index);
        setData(result);
      } catch {
        toast.error('Error al cargar los detalles de la raza');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [index]);

  if (loading) {
    return <SRDLoader />;
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex flex-col items-center">
          <Footprints className="w-4 h-4 text-orange-500/60 mb-1" />
          <span className="text-[9px] uppercase font-bold text-gray-500">
            Velocidad
          </span>
          <span className="text-base font-black text-gray-100">
            {data.speed} ft
          </span>
        </div>
        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex flex-col items-center">
          <Scale className="w-4 h-4 text-indigo-500/60 mb-1" />
          <span className="text-[9px] uppercase font-bold text-gray-500">
            Tamaño
          </span>
          <span className="text-base font-black text-gray-100">
            {data.size}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {data.ability_bonuses?.length > 0 && (
          <DataItem
            label="Bonificadores"
            icon={Zap}
            value={
              <div className="flex gap-2">
                {data.ability_bonuses.map((b, i) => (
                  <div
                    key={i}
                    className="px-2 py-0.5 rounded bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] font-bold"
                  >
                    {b.ability_score.name} +{b.bonus}
                  </div>
                ))}
              </div>
            }
          />
        )}

        <DataItem
          label="Rasgos"
          icon={ScrollIcon}
          value={<TagList items={data.traits} />}
        />
        <DataItem
          label="Idiomas"
          icon={Languages}
          value={
            <p className="text-xs text-gray-400 leading-relaxed">
              {data.language_desc}
            </p>
          }
        />
        <DataItem
          label="Alineamiento"
          icon={Scale}
          value={
            <p className="text-xs text-gray-400 leading-relaxed">
              {data.alignment}
            </p>
          }
        />
        <DataItem
          label="Edad"
          icon={BookOpen}
          value={
            <p className="text-xs text-gray-400 leading-relaxed">{data.age}</p>
          }
        />
        <DataItem
          label="Subrazas"
          icon={Dna}
          value={<TagList items={data.subraces} />}
        />
      </div>
    </div>
  );
}
