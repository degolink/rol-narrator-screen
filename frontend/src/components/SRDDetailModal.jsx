import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { srdService } from '../services/srdService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Heart,
  Shield,
  Zap,
  Footprints,
  BookOpen,
  Swords,
  Languages,
  Scroll as ScrollIcon,
  Scale,
  GitBranch,
  Dna,
} from 'lucide-react';

// Specialized components for clean data display
const DataItem = ({ label, value, icon: Icon }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;

  return (
    <div className="space-y-1.5 mb-4 px-1">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-3 h-3 text-yellow-500/50" />}
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
          {label}
        </span>
      </div>
      <div className="text-sm text-gray-200 leading-relaxed pl-5 border-l border-gray-800/50">
        {value}
      </div>
    </div>
  );
};

const TagList = ({ items, variant = 'secondary' }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <Badge
          key={i}
          variant={variant}
          className="text-[10px] py-0 px-2 font-medium bg-white/[0.03] border-white/5 text-gray-400 capitalize whitespace-nowrap"
        >
          {typeof item === 'string' ? item : item.name || item.item?.name}
        </Badge>
      ))}
    </div>
  );
};

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
        else if (type === 'alignment')
          result = await srdService.getAlignment(index);
        setData(result);
      } catch (err) {
        console.error('Error fetching SRD details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isOpen, index, type]);

  const renderClass = (item) => (
    <div className="space-y-6">
      <div className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="flex-1 flex flex-col items-center justify-center border-r border-white/5">
          <Heart className="w-4 h-4 text-red-500/60 mb-1" />
          <span className="text-[9px] uppercase font-bold text-gray-500 tracking-tighter">
            Vida (Dado)
          </span>
          <span className="text-lg font-black text-gray-100">
            d{item.hit_die}
          </span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <Shield className="w-4 h-4 text-blue-500/60 mb-1" />
          <span className="text-[9px] uppercase font-bold text-gray-500 tracking-tighter">
            Salvaciones
          </span>
          <div className="flex gap-1">
            {item.saving_throws?.map((s, i) => (
              <span key={i} className="text-xs font-bold text-gray-200">
                {s.name}
                {i < item.saving_throws.length - 1 ? ',' : ''}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <DataItem
          label="Competencias"
          icon={Swords}
          value={<TagList items={item.proficiencies} />}
        />

        {item.proficiency_choices?.map((choice, i) => (
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

        {item.multiclassing && (
          <DataItem
            label="Multiclase"
            icon={GitBranch}
            value={
              <div className="space-y-2">
                {item.multiclassing.prerequisites?.map((pre, j) => (
                  <p key={j} className="text-xs text-gray-400">
                    Prerrequisito: {pre.ability_score.name} {pre.minimum_score}+
                  </p>
                ))}
                <TagList items={item.multiclassing.proficiencies} />
              </div>
            }
          />
        )}

        <DataItem
          label="Subclases"
          icon={Dna}
          value={<TagList items={item.subclasses} />}
        />
      </div>
    </div>
  );

  const renderRace = (item) => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex flex-col items-center">
          <Footprints className="w-4 h-4 text-orange-500/60 mb-1" />
          <span className="text-[9px] uppercase font-bold text-gray-500">
            Velocidad
          </span>
          <span className="text-base font-black text-gray-100">
            {item.speed} ft
          </span>
        </div>
        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex flex-col items-center">
          <Scale className="w-4 h-4 text-indigo-500/60 mb-1" />
          <span className="text-[9px] uppercase font-bold text-gray-500">
            Tamaño
          </span>
          <span className="text-base font-black text-gray-100">
            {item.size}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {item.ability_bonuses?.length > 0 && (
          <DataItem
            label="Bonificadores"
            icon={Zap}
            value={
              <div className="flex gap-2">
                {item.ability_bonuses.map((b, i) => (
                  <Badge
                    key={i}
                    className="bg-green-500/10 text-green-500 border-green-500/20"
                  >
                    {b.ability_score.name} +{b.bonus}
                  </Badge>
                ))}
              </div>
            }
          />
        )}

        <DataItem
          label="Rasgos"
          icon={ScrollIcon}
          value={<TagList items={item.traits} />}
        />
        <DataItem
          label="Idiomas"
          icon={Languages}
          value={
            <p className="text-xs text-gray-400 leading-relaxed">
              {item.language_desc}
            </p>
          }
        />
        <DataItem
          label="Alineamiento"
          icon={Scale}
          value={
            <p className="text-xs text-gray-400 leading-relaxed">
              {item.alignment}
            </p>
          }
        />
        <DataItem
          label="Edad"
          icon={BookOpen}
          value={
            <p className="text-xs text-gray-400 leading-relaxed">{item.age}</p>
          }
        />
        <DataItem
          label="Subrazas"
          icon={Dna}
          value={<TagList items={item.subraces} />}
        />
      </div>
    </div>
  );

  const renderAlignment = (item) => (
    <div className="py-2">
      <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-2xl p-6 relative overflow-hidden group">
        <Scale className="absolute -right-4 -bottom-4 w-32 h-32 text-yellow-500/5 rotate-12 transition-transform group-hover:rotate-0 duration-700" />
        <p className="text-sm text-gray-300 leading-relaxed relative z-10 italic">
          "{item.desc}"
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-[#0c0c0e] border border-white/5 text-gray-100 shadow-2xl p-0 overflow-hidden ring-1 ring-white/10">
        <DialogHeader className="p-8 pb-4 relative">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-yellow-500/5 to-transparent pointer-events-none" />
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] uppercase font-black tracking-[0.4em] text-yellow-500/40 block mb-1">
              Ref. {type}
            </span>
            <DialogTitle className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">
              {data?.name || (loading ? 'Identificando...' : 'Desconocido')}
            </DialogTitle>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-8 pb-8 pt-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
              <span className="text-[10px] uppercase font-black tracking-widest text-gray-600 animate-pulse">
                Consultando el Archivo Real...
              </span>
            </div>
          ) : data ? (
            <div className="animate-in fade-in slide-in-from-top-4 duration-700">
              {type === 'class' && renderClass(data)}
              {type === 'race' && renderRace(data)}
              {type === 'alignment' && renderAlignment(data)}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-gray-500 font-medium">
                No hay registros adicionales en esta sección.
              </p>
            </div>
          )}
        </ScrollArea>

        <div className="p-4 bg-black/40 border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:border-white/10 transition-all hover:scale-105 active:scale-95"
          >
            Cerrar Códice
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
