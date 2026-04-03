import React, { useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiService } from '@/services/apiService';

export function DeleteCharacterDialog({
  open,
  character,
  setCharacterToDelete,
}) {
  const { id, name } = character;

  const close = useCallback(() => {
    setCharacterToDelete(undefined);
  }, [setCharacterToDelete]);

  const deleteCharacter = useCallback(async () => {
    try {
      await apiService.deleteWithNotify(
        `characters/${id}/`,
        'Personaje eliminado correctamente',
      );
    } catch (err) {
      console.error('Error deleting character', err);
    } finally {
      close();
    }
  }, [id, close]);

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-red-400 flex items-center gap-2">
            <Trash2 className="h-5 w-5" /> Eliminar personaje
          </DialogTitle>
          <DialogDescription className="text-gray-400 pt-2">
            <p>
              ¿Estás seguro de que quieres eliminar a{' '}
              <span className="text-yellow-300 font-bold">{name}</span>?
            </p>
            <p>Esta acción no se puede deshacer.</p>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-2 mt-4">
          <Button variant="destructive" onClick={deleteCharacter}>
            Eliminar
          </Button>
          <Button variant="outline" onClick={close}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
