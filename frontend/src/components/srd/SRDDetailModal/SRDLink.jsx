import React, { useCallback } from 'react';
import { useSRDModal } from '@/context/SRDModalContext';
import { Badge } from '@/components/ui/badge';

/**
 * @typedef {Object} SRDLinkProps
 * @property {string} name - Display name for the link.
 * @property {string} index - SRD index for the entity.
 * @property {string} [type] - Entity type (e.g. 'class', 'race').
 * @property {string} [url] - Direct SRD URL to extract type from.
 * @property {string} [className] - Optional CSS classes.
 */

/**
 * Clickable badge that navigates the global SRD modal.
 * @param {SRDLinkProps} props
 */
export function SRDLink({ name, index, type, url, className }) {
  const { changeView } = useSRDModal();

  /**
   * Helper to parse type from URL if not provided.
   * e.g. /api/traits/darkvision -> traits
   */
  const getParsedType = useCallback(() => {
    if (type) return type;
    if (!url) return null;
    const parts = url.split('/');
    // Type is usually the second to last part in /api/{type}/{index}
    return parts[parts.length - 2];
  }, [type, url]);

  const handleClick = useCallback(
    (e) => {
      e.preventDefault();
      const parsedType = getParsedType();
      if (parsedType && index) {
        // Normalize type for our system (e.g. traits -> trait)
        const normalizedType = parsedType.replace(/s$/, '');
        changeView(normalizedType, index);
      }
    },
    [getParsedType, index, changeView],
  );

  return (
    <button
      onClick={handleClick}
      className={`text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${className}`}
    >
      <Badge
        variant="secondary"
        className="text-[10px] py-0 px-2 font-medium bg-white/[0.05] border-white/10 text-yellow-500/80 hover:text-yellow-500 hover:bg-white/[0.08] cursor-pointer"
      >
        {name}
      </Badge>
    </button>
  );
}
