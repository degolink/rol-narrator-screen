import React from 'react';

export function SectionTitle({ children, icon: Icon }) {
  return (
    <div className="flex items-center gap-2 mb-4 mt-6 first:mt-0">
      {Icon && <Icon className="h-4 w-4 text-purple-400" />}
      <h3 className="text-xs font-black uppercase tracking-widest text-purple-300/80">
        {children}
      </h3>
      <div className="h-px flex-1 bg-gradient-to-r from-gray-800 to-transparent"></div>
    </div>
  );
}
