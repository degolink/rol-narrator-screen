import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSRDModal } from '../../../context/SRDModalContext';

// Views
import SRDClassView from './views/SRDClassView';
import SRDRaceView from './views/SRDRaceView';
import SRDAlignmentView from './views/SRDAlignmentView';
import SRDGenericView from './views/SRDGenericView';

const VIEW_COMPONENTS = {
  class: SRDClassView,
  race: SRDRaceView,
  alignment: SRDAlignmentView,
};

export function SRDDetailModal() {
  const { isOpen, type, index, closeModal } = useSRDModal();

  const ViewComponent = VIEW_COMPONENTS[type] || SRDGenericView;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-xl bg-[#0c0c0e] border border-white/5 text-gray-100 shadow-2xl p-0 overflow-hidden ring-1 ring-white/10">
        <DialogHeader className="p-8 pb-4 relative">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-yellow-500/5 to-transparent pointer-events-none" />
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] uppercase font-black tracking-[0.4em] text-yellow-500/40 block mb-1">
              Ref. {type}
            </span>
            <DialogTitle className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">
              Detalles del Códice
            </DialogTitle>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-8 pb-8 pt-2">
          {isOpen && ViewComponent ? (
            <div className="animate-in fade-in slide-in-from-top-4 duration-700">
              <ViewComponent type={type} index={index} />
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
            onClick={closeModal}
            className="px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:border-white/10 transition-all hover:scale-105 active:scale-95"
          >
            Cerrar Códice
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
