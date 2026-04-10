import React from 'react';
import { X } from 'lucide-react';
import { CharacterForm } from '../../components/CharacterForm';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export function CharactersDrawer({ isOpen, onClose, mode, character }) {
  if (!isOpen) return null;
  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full data-[side=right]:sm:max-w-xl data-[side=right]:md:max-w-2xl bg-[#0c0c0e] border-l border-border text-gray-100 overflow-y-auto p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b border-border sticky top-0 bg-[#0c0c0e] z-10 flex flex-row items-center justify-between space-y-0">
          <div>
            <SheetTitle className="text-xl font-black text-yellow-400 uppercase tracking-tighter italic">
              {mode === 'edit' ? 'Editar Personaje' : 'Crear Personaje'}
            </SheetTitle>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">
              Panel del Narrador
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="text-gray-500 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>

        <div className="flex-1 p-6">
          <CharacterForm
            key={character?.id ?? 'new'}
            character={character}
            close={onClose}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
