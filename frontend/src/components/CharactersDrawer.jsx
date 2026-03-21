import React from 'react';
import { CharacterForm } from './CharacterForm';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const CharactersDrawer = ({ isOpen, onClose, mode, character, onSaved }) => {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full data-[side=right]:sm:max-w-xl data-[side=right]:md:max-w-2xl data-[side=right]:lg:max-w-3xl bg-gray-900 border-gray-800 text-gray-100 overflow-y-auto p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <SheetTitle className="text-yellow-300 font-bold text-base uppercase tracking-tighter" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            {mode === 'edit' ? 'Editar personaje' : 'Crear personaje'}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 p-6">
          <CharacterForm
            key={character?.id ?? 'new'}
            character={character}
            onSaved={onSaved}
            onCancel={onClose}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export { CharactersDrawer };
