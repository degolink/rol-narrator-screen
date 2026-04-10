import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { getCroppedImgFile } from '../utils/imageUtils';

export function ImageCropper({ image, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const onCropCompleteInternal = useCallback(
    (_croppedArea, croppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleConfirm = async () => {
    try {
      const croppedFile = await getCroppedImgFile(image, croppedAreaPixels);
      onCropComplete(croppedFile);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={!!image} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold uppercase italic tracking-wider">
            Ajustar Retrato
          </DialogTitle>
        </DialogHeader>
        <div className="relative w-full h-[400px] bg-black rounded-lg overflow-hidden border border-gray-800">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteInternal}
            onZoomChange={onZoomChange}
          />
        </div>
        <div className="mt-4 space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase">
            Zoom
          </label>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(e.target.value)}
            className="w-full"
          />
        </div>
        <DialogFooter className="mt-6 flex gap-2">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="text-gray-400 hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold"
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
