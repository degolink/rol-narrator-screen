import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * A badge that indicates whether a character is visible to everyone or only to the GM.
 * 
 * @param {Object} props
 * @param {boolean} props.visible - Whether the character is publicly visible
 * @param {boolean} [props.isDungeonMaster] - If true, show the badge (usually only for GMs)
 * @param {string} [props.className] - Additional classes
 */
export function VisibilityBadge({ visible, isDungeonMaster, className }) {
  if (!isDungeonMaster) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-1.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-tighter transition-colors',
        visible
          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
          : 'bg-red-500/10 text-red-500 border-red-500/20',
        className
      )}
      title={visible ? 'Visible para todos' : 'Solo visible para ti'}
    >
      {visible ? (
        <Eye className="w-2.5 h-2.5" />
      ) : (
        <EyeOff className="w-2.5 h-2.5" />
      )}
      <span>{visible ? 'Público' : 'Oculto'}</span>
    </div>
  );
}
