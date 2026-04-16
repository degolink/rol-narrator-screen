import React from 'react';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SRDLink } from './SRDLink';

export function DataItem({ label, value, icon: Icon }) {
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
}

export function TagList({ items, variant = 'secondary', type }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => {
        const name =
          typeof item === 'string' ? item : item.name || item.item?.name;
        const index = item.index || item.item?.index;
        const url = item.url || item.item?.url;

        if (index && (url || type)) {
          return (
            <SRDLink key={i} name={name} index={index} type={type} url={url} />
          );
        }

        return (
          <Badge
            key={i}
            variant={variant}
            className="text-[10px] py-0 px-2 font-medium bg-white/[0.03] border-white/5 text-gray-400 capitalize whitespace-nowrap"
          >
            {name}
          </Badge>
        );
      })}
    </div>
  );
}

export function SRDLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
    </div>
  );
}
