import React, { useState } from 'react';
import { toast } from 'sonner';
import { CoinUpdater } from './CoinUpdater';
import { apiService } from '../services/apiService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Edit2, Trash2, Shield, Zap, Swords, Eye, EyeOff, Share2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// D&D 5e modifier = floor((score - 10) / 2)
const mod = (score) => {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
};

// ─── Attribute cell ─────────────────────────────────────────────
const StatCell = ({ label, value }) => (
  <div className="flex flex-col bg-gray-900/80 rounded-lg py-2 px-3 border border-gray-700/50 transition-colors hover:border-purple-500/50">
    <div className="flex justify-between items-center w-full mb-1">
      <span className="text-gray-500 font-bold text-[10px] tracking-widest uppercase">{label}</span>
      <span className="text-purple-400 text-[10px] font-medium">{mod(value)}</span>
    </div>
    <span className="text-gray-100 font-bold text-base leading-tight">{value}</span>
  </div>
);

// ─── Main component ──────────────────────────────────────────────────────────
const CharacterCard = ({ character, onEdit, onDelete, onToggleVisibility }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteConfirm = async () => {
    try {
      await apiService.deleteWithNotify(`characters/${character.id}/`, 'Personaje eliminado correctamente');
      onDelete(character.id);
    } catch (err) {
      console.error('Error deleting character', err);
    } finally {
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Eliminar personaje
            </DialogTitle>
            <DialogDescription className="text-gray-400 pt-2 text-balance">
              ¿Estás seguro de que quieres eliminar a <span className="text-yellow-300 font-bold">{character.name}</span>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-center mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="border-gray-700 hover:bg-gray-800 text-gray-300">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} className="bg-red-700 hover:bg-red-600">
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300 group overflow-hidden shadow-xl shadow-black/20">
        {/* ── Header ── */}
        <CardHeader className="p-5 pb-4 border-b border-gray-700/50 bg-gray-800/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold text-yellow-300 truncate flex items-baseline gap-2">
                  <span>{character.name}</span>
                  {character.nickname && (
                    <span className="text-sm text-gray-400 italic font-normal">"{character.nickname}"</span>
                  )}
                </CardTitle>
                {character.alignment && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-gray-600 text-gray-500 font-normal uppercase tracking-tighter">
                    {character.alignment}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-1 flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-gray-300">Niv.{character.level}</span>
                {character.char_class && (
                  <>
                    <span className="text-gray-600">·</span>
                    <span className="text-purple-300 font-medium">{character.char_class}{character.secondary_class ? ` / ${character.secondary_class}` : ''}</span>
                  </>
                )}
                {character.race && (
                  <>
                    <span className="text-gray-600">·</span>
                    <span className="text-gray-400">{character.race}</span>
                  </>
                )}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1 flex-1 bg-gray-950 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600" style={{ width: `${Math.min(100, (character.experience / 355000) * 100)}%` }}></div>
                </div>
                <span className="text-[10px] text-gray-600 font-mono">{character.experience ?? 0} XP</span>
              </div>
            </div>
            <div className="flex gap-1">
              {onToggleVisibility && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onToggleVisibility(character.id, character.visible)}
                      className={`h-8 w-8 ${character.visible ? 'text-green-400 hover:text-green-300 hover:bg-green-400/10' : 'text-gray-600 hover:text-gray-400 hover:bg-gray-400/10'}`}
                    >
                      {character.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{character.visible ? "Ocultar Personaje" : "Hacer Público"}</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {!character.npc && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/personaje/${character.id}`);
                          toast.success("Enlace copiado al portapapeles");
                        }}
                        className="h-8 w-8 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copiar enlace al portapapeles</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={`/personaje/${character.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 w-8 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Abrir página en nueva pestaña</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(character)}
                    className="h-8 w-8 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Editar Personaje</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDeleteDialog(true)}
                    className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Eliminar Personaje</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardHeader>

        {/* ── Body ── */}
        <CardContent className="p-5 space-y-6">
          {/* HP + Energy */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900/40 p-3 rounded-xl border border-gray-700/30 flex items-center gap-3">
              <div className="bg-red-500/10 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">Puntos de Vida</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-red-400">{character.hp}</span>
                  <span className="text-gray-600 text-xs">/ {character.max_hp}</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-900/40 p-3 rounded-xl border border-gray-700/30 flex items-center gap-3">
              <div className="bg-blue-500/10 p-2 rounded-lg">
                <Zap className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">Energía</span>
                <p className="text-xl font-bold text-blue-400">{character.energy}</p>
              </div>
            </div>
          </div>

          {/* Attributes */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Swords className="h-4 w-4 text-yellow-300 opacity-50" />
              <p className="text-xs text-yellow-300/80 font-black uppercase tracking-widest">Atributos</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <StatCell label="FUE" value={character.strength} />
              <StatCell label="DES" value={character.dexterity} />
              <StatCell label="CON" value={character.constitution} />
              <StatCell label="INT" value={character.intelligence} />
              <StatCell label="SAB" value={character.wisdom} />
              <StatCell label="CAR" value={character.charisma} />
            </div>
          </div>

          {/* Coins */}
          <div className="pt-2">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3 text-center border-b border-gray-700/50 pb-2">Inventario Monetario</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <CoinUpdater characterId={character.id} type="copper" label="Cobre" amount={character.copper} onUpdate={onEdit} colorClass="text-[#b87333]" />
              <CoinUpdater characterId={character.id} type="silver" label="Plata" amount={character.silver} onUpdate={onEdit} colorClass="text-[#c0c0c0]" />
              <CoinUpdater characterId={character.id} type="gold" label="Oro" amount={character.gold} onUpdate={onEdit} colorClass="text-[#ffd700]" />
              <CoinUpdater characterId={character.id} type="platinum" label="Platino" amount={character.platinum} onUpdate={onEdit} colorClass="text-[#e5e4e2]" />
            </div>
          </div>

          {/* Historia */}
          {(character.background_story || character.motivations) && (
            <div className="bg-black/20 p-3 rounded-lg border border-gray-700/30 space-y-2">
              {character.background_story && (
                <p className="text-[10px] text-gray-400 italic leading-relaxed">
                  "{character.background_story}"
                </p>
              )}
              {character.motivations && (
                <p className="text-[10px] text-gray-400">
                  <span className="text-gray-300 font-bold uppercase tracking-tighter">Motivación: </span>
                  {character.motivations}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export { CharacterCard };
