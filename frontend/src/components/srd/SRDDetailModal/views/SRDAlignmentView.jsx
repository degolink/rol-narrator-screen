import React, { useState, useEffect } from 'react';
import { Scale } from 'lucide-react';
import { toast } from 'sonner';
import { useSRDModal } from '@/context/SRDModalContext';
import { srdService } from '@/services/srdService';
import { SRDLoader } from '../SRDCommon';

export default function SRDAlignmentView({ index }) {
  const { setTitle } = useSRDModal();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result = await srdService.getAlignment(index);
        setData(result);
        setTitle(result.name);
      } catch {
        toast.error('Error al cargar los detalles del alineamiento');
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
    <div className="py-2">
      <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-2xl p-6 relative overflow-hidden group">
        <Scale className="absolute -right-4 -bottom-4 w-32 h-32 text-yellow-500/5 rotate-12 transition-transform group-hover:rotate-0 duration-700" />
        <p className="text-sm text-gray-300 leading-relaxed relative z-10 italic">
          "{data.desc}"
        </p>
      </div>
    </div>
  );
}
