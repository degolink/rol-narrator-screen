import React from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AvatarSection({
  image,
  onImageSelect,
  onRemoveImage,
  fileInputRef,
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="relative group">
        <div className="w-32 h-32 rounded-2xl bg-gray-950 border-2 border-gray-800 overflow-hidden shadow-2xl transition-all group-hover:border-purple-500/50">
          {image ? (
            <img
              src={image instanceof File ? URL.createObjectURL(image) : image}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-700">
              <Camera className="w-8 h-8 mb-2" />
              <span className="text-[10px] font-black uppercase">Sin Foto</span>
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={onImageSelect}
          accept="image/*"
          className="hidden"
        />

        <div className="absolute -bottom-2 -right-2 flex gap-1">
          <Button
            type="button"
            variant="secondary"
            size="icon-xs"
            onClick={() => fileInputRef.current?.click()}
            className="bg-purple-600 hover:bg-purple-500 text-white shadow-xl"
          >
            <Camera className="w-3 h-3" />
          </Button>
          {image && (
            <Button
              type="button"
              variant="destructive"
              size="icon-xs"
              onClick={onRemoveImage}
              className="shadow-xl"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
        Avatar del Héroe (1:1)
      </p>
    </div>
  );
}
