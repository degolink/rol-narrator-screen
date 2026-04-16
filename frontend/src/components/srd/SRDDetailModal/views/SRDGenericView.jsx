import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { useSRDModal } from '@/context/SRDModalContext';
import { srdService } from '@/services/srdService';
import { DataItem, SRDLoader } from '../SRDCommon';

export default function SRDGenericView({ type, index }) {
  const { setTitle } = useSRDModal();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result = await srdService.getItem(type, index);
        setData(result);
        setTitle(result.name);
      } catch {
        toast.error(`Error al cargar los detalles de ${type}`);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [type, index, setTitle]);

  if (loading) {
    return <SRDLoader />;
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {data.desc ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-yellow-500/60" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Descripción
            </span>
          </div>
          <div className="space-y-4">
            {Array.isArray(data.desc) ? (
              data.desc.map((d, i) => (
                <p
                  key={i}
                  className="text-sm text-gray-300 leading-relaxed font-light"
                >
                  {d}
                </p>
              ))
            ) : (
              <p className="text-sm text-gray-300 leading-relaxed font-light">
                {data.desc}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="py-10 text-center border-2 border-dashed border-white/5 rounded-xl">
          <p className="text-xs text-gray-600 uppercase tracking-widest font-black">
            Sin descripción detallada disponible
          </p>
        </div>
      )}

      {/* Render properties that are common in traits/features */}
      <div className="grid grid-cols-1 gap-4">
        {data.prerequisites && (
          <DataItem label="Prerrequisitos" value={data.prerequisites} />
        )}
      </div>
    </div>
  );
}
