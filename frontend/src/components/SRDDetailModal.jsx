import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { srdService } from '../services/srdService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

export function SRDDetailModal({ isOpen, onClose, type, index }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !index) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        let result;
        if (type === 'class') result = await srdService.getClass(index);
        else if (type === 'race') result = await srdService.getRace(index);
        else if (type === 'alignment') result = await srdService.getAlignment(index);
        setData(result);
      } catch (err) {
        console.error('Error fetching SRD details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, index, type]);

  const renderValue = (val) => {
    if (typeof val === 'object' && val !== null) {
      if (Array.isArray(val)) {
        return (
          <ul className="list-disc list-inside space-y-1">
            {val.map((item, i) => (
              <li key={i}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</li>
            ))}
          </ul>
        );
      }
      return <pre className="text-[10px] whitespace-pre-wrap">{JSON.stringify(val, null, 2)}</pre>;
    }
    return String(val);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-950 border-gray-800 text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-yellow-400 capitalize flex items-center gap-2">
            {data?.name || (loading ? 'Cargando...' : 'Detalles')}
            <span className="text-[10px] uppercase text-gray-500 font-normal py-0.5 px-2 bg-gray-900 border border-gray-800 rounded">
              {type === 'class' ? 'Clase' : type === 'race' ? 'Raza' : 'Alineamiento'}
            </span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
            </div>
          ) : data ? (
            <div className="space-y-6 pb-4">
              {Object.entries(data).map(([key, value]) => {
                // Skip common metadata fields that are repetitive or not useful for the user
                if (['index', 'url', '_id', 'name'].includes(key)) return null;
                
                return (
                  <div key={key} className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-800 pb-1">
                      {key.replace(/_/g, ' ')}
                    </h4>
                    <div className="text-sm text-gray-300">
                      {renderValue(value)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No se pudieron cargar los detalles.
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
