import React from 'react';
import { User, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SectionTitle } from './SectionTitle';

export function IdentitySection({
  formData,
  errors,
  isDungeonMaster,
  onChange,
  onUpdateField,
}) {
  return (
    <div>
      <div className="flex justify-between items-center w-full">
        <SectionTitle icon={User}>Identidad</SectionTitle>
        <div className="flex flex-col items-end gap-1 relative">
          {!!isDungeonMaster && (
            <div className="flex items-center gap-4 mb-4 mt-6">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="npc"
                  className="text-[10px] text-gray-400 uppercase font-black cursor-pointer"
                >
                  NPC
                </Label>
                <Switch
                  id="npc"
                  checked={formData.npc}
                  onCheckedChange={(checked) => onUpdateField('npc', checked)}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => onUpdateField('visible', !formData.visible)}
              >
                {formData.visible ? (
                  <Eye className="w-5 h-5 text-green-400" />
                ) : (
                  <EyeOff className="w-5 h-5 text-gray-600" />
                )}
                <span className="text-[10px] text-gray-400 uppercase font-black">
                  {formData.visible ? 'Público' : 'Oculto'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="name"
            className="text-[10px] text-gray-500 uppercase font-black"
          >
            Nombre del Personaje
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="Ej: Thrain Escudo"
            className={`bg-gray-950 border-gray-800 focus:border-purple-500/50 ${errors.name ? 'border-red-500' : ''}`}
          />
          {errors.name && (
            <p className="text-[10px] text-red-400">{errors.name}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="nickname"
            className="text-[10px] text-gray-500 uppercase font-black"
          >
            Apodo o Título
          </Label>
          <Input
            id="nickname"
            name="nickname"
            value={formData.nickname}
            onChange={onChange}
            placeholder="Ej: El Valeroso"
            className="bg-gray-950 border-gray-800 focus:border-purple-500/50"
          />
        </div>
      </div>
    </div>
  );
}
