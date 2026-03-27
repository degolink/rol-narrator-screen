import React from 'react';
import { X } from 'lucide-react';
import { CharacterForm } from './CharacterForm';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';


export function CharactersDrawer({ isOpen, onClose, mode, character, onSaved }) {
  if (!isOpen) return null;
  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full data-[side=right]:sm:max-w-xl data-[side=right]:md:max-w-2xl data-[side=right]:lg:max-w-3xl bg-gray-900 border-gray-800 text-gray-100 overflow-y-auto p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b border-gray-800 sticky top-0 bg-gray-900 z-10 flex flex-row items-center justify-between space-y-0">
          <SheetTitle
            className="text-yellow-300 font-bold text-base uppercase tracking-tighter"
            style={{ fontFamily: "'Press Start 2P', cursive" }}
          >
            {mode === 'edit' ? 'Editar personaje' : 'Crear personaje'}
          </SheetTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
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
