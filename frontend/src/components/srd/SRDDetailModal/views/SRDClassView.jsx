import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Heart, Shield, Swords, Zap, GitBranch, Dna } from 'lucide-react';
import { srdService } from '@/services/srdService';
import { DataItem, TagList, SRDLoader } from '../SRDCommon';
import { useSRDModal } from '@/context/SRDModalContext';

export default function SRDClassView({ index }) {
  const { setTitle } = useSRDModal();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result = await srdService.getClass(index);
        setData(result);
        setTitle(result.name);
      } catch {
        toast.error('Error al cargar los detalles de la clase');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [index, setTitle]);

  if (loading) {
    return <SRDLoader />;
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="flex-1 flex flex-col items-center justify-center border-r border-white/5">
          <Heart className="w-4 h-4 text-red-500/60 mb-1" />
          <span className="text-[9px] uppercase font-bold text-gray-500 tracking-tighter">
            Vida (Dado)
          </span>
          <span className="text-lg font-black text-gray-100">
            d{data.hit_die}
          </span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <Shield className="w-4 h-4 text-blue-500/60 mb-1" />
          <span className="text-[9px] uppercase font-bold text-gray-500 tracking-tighter">
            Salvaciones
          </span>
          <div className="flex gap-1">
            {data.saving_throws?.map((s, i) => (
              <span key={i} className="text-xs font-bold text-gray-200">
                {s.name}
                {i < data.saving_throws.length - 1 ? ',' : ''}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <DataItem
          label="Competencias"
          icon={Swords}
          value={<TagList items={data.proficiencies} />}
        />

        {data.proficiency_choices?.map((choice, i) => (
          <DataItem
            key={i}
            label={`Habilidades (Elige ${choice.choose})`}
            icon={Zap}
            value={
              <p className="text-xs text-gray-500 italic">
                {choice.from.options
                  ?.map((o) => o.item?.name || o.name)
                  .join(', ')}
              </p>
            }
          />
        ))}

        {data.multiclassing && (
          <DataItem
            label="Multiclase"
            icon={GitBranch}
            value={
              <div className="space-y-2">
                {data.multiclassing.prerequisites?.map((pre, j) => (
                  <p key={j} className="text-xs text-gray-400">
                    Prerrequisito: {pre.ability_score.name} {pre.minimum_score}+
                  </p>
                ))}
                <TagList items={data.multiclassing.proficiencies} />
              </div>
            }
          />
        )}

        <DataItem
          label="Subclases"
          icon={Dna}
          value={<TagList items={data.subclasses} />}
        />
      </div>
    </div>
  );
}
