import React from 'react';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SRDLink } from './SRDLink';

/**
 * @typedef {Object} DataItemProps
 * @property {string} label - The label for the data item.
 * @property {React.ReactNode} value - The content to display.
 * @property {import('lucide-react').LucideIcon} [icon] - Optional icon component.
 */

/**
 * Renders a labeled data row for SRD details.
 * @param {DataItemProps} props
 */
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

/**
 * @typedef {Object} TagListProps
 * @property {Array<string|Object>} items - List of items to render.
 * @property {string} [variant] - Badge variant.
 * @property {string} [type] - Entity type for linking.
 */

/**
 * Renders a list of badges, potentially as SRDLinks.
 * @param {TagListProps} props
 */
export function TagList({ items, variant = 'secondary', type }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => {
        const name =
          typeof item === 'string' ? item : item.name || item.item?.name;
        // @ts-ignore - Index might exist on object
        const index = item?.index || item?.item?.index;
        // @ts-ignore - URL might exist on object
        const url = item?.url || item?.item?.url;

        const isLinkable =
          index &&
          (url || type) &&
          !url?.includes('proficiencies') &&
          !url?.includes('languages') &&
          type !== 'proficiency';

        if (isLinkable) {
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

/**
 * Loading spinner component for SRD views.
 */
export function SRDLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
    </div>
  );
}
