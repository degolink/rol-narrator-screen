import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { levelFromXp, minXpForLevel } from '../utils/levels';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Sparkles,
  Save,
  User,
  Shield,
  Zap,
  BookOpen,
  Eye,
  EyeOff,
} from 'lucide-react';

// ─── D&D 5e valid values ───────────────────────────────────────────────────
const CLASES = [
  'Artífice',
  'Bárbaro',
  'Bardo',
  'Brujo',
  'Clérigo',
  'Druida',
  'Explorador',
  'Guerrero',
  'Hechicero',
  'Mago',
  'Monje',
  'Paladín',
  'Pícaro',
];

const RAZAS = [
  'Aasimar',
  'Dracónido',
  'Druida del Fuego',
  'Elfo (Alto)',
  'Elfo (Bosque)',
  'Elfo (Drow)',
  'Enano (Colinas)',
  'Enano (Montaña)',
  'Genasi (Agua)',
  'Genasi (Aire)',
  'Genasi (Fuego)',
  'Genasi (Tierra)',
  'Gnomo (Bosque)',
  'Gnomo (Rocas)',
  'Humano',
  'Mediano (Fornido)',
  'Mediano (Pie Ligero)',
  'Semielfo',
  'Semiorco',
  'Tiefling',
];

const ALINEAMIENTOS = [
  'Legal Bueno',
  'Neutral Bueno',
  'Caótico Bueno',
  'Legal Neutral',
  'Neutral',
  'Caótico Neutral',
  'Legal Malvado',
  'Neutral Malvado',
  'Caótico Malvado',
];

const NIVELES = Array.from({ length: 20 }, (_, i) => i + 1);

// D&D 5e mod
const mod = (score) => {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
};

// ─── Default form state ────────────────────────────────────────────────────
const EMPTY = {
  name: '',
  nickname: '',
  char_class: '',
  secondary_class: '',
  race: '',
  alignment: '',
  level: 1,
  experience: 0,
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
  hp: 10,
  max_hp: 10,
  energy: 0,
  background_story: '',
  motivations: '',
  npc: false,
  visible: false,
};

const CharacterForm = ({ character, onSaved, onCancel, isMaster = true }) => {
  const isEdit = Boolean(character);
  const [formData, setFormData] = useState(
    character ? { ...character } : { ...EMPTY },
  );
  const [levelUpMsg, setLevelUpMsg] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  const updateField = (name, value) => {
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    // XP → auto level
    if (name === 'experience') {
      const xp = parseInt(value, 10) || 0;
      const newLevel = levelFromXp(xp);
      if (newLevel > parseInt(formData.level, 10)) {
        setLevelUpMsg(`🎉 ¡Nivel ${newLevel}!`);
        setTimeout(() => setLevelUpMsg(null), 4000);
      }
      setFormData((prev) => ({ ...prev, experience: xp, level: newLevel }));
      return;
    }

    // Level → correct XP into valid range
    if (name === 'level') {
      const newLevel = Math.max(1, Math.min(20, parseInt(value, 10) || 1));
      const currentXp = parseInt(formData.experience, 10) || 0;
      const minXp = minXpForLevel(newLevel);
      const nextMinXp = minXpForLevel(newLevel + 1);
      const correctedXp =
        currentXp < minXp
          ? minXp
          : newLevel < 20 && currentXp >= nextMinXp
            ? minXp
            : currentXp;
      setFormData((prev) => ({
        ...prev,
        level: newLevel,
        experience: correctedXp,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!formData.name) newErrors.name = 'El nombre es requerido';
    if (!formData.npc) {
      if (!formData.char_class) newErrors.char_class = 'La clase es requerida';
      if (!formData.race) newErrors.race = 'La raza es requerida';
      if (!formData.alignment)
        newErrors.alignment = 'El alineamiento es requerido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const successMsg = isEdit
        ? 'Personaje actualizado correctamente'
        : '¡Héroe creado con éxito!';
      const response = isEdit
        ? await apiService.patchWithNotify(
            `characters/${character.id}/`,
            formData,
            successMsg,
          )
        : await apiService.postWithNotify('characters/', formData, successMsg);

      if (!isEdit) setFormData({ ...EMPTY });
      setErrors({});
      onSaved(response.data);
    } catch (err) {
      console.error('Error saving character', err);
    } finally {
      setLoading(false);
    }
  };

  const SectionTitle = ({ children, icon: Icon }) => (
    <div className="flex items-center gap-2 mb-4 mt-6 first:mt-0">
      {Icon && <Icon className="h-4 w-4 text-purple-400" />}
      <h3 className="text-xs font-black uppercase tracking-widest text-purple-300/80">
        {children}
      </h3>
      <div className="h-px flex-1 bg-gradient-to-r from-gray-800 to-transparent"></div>
    </div>
  );

  return (
    <>
      {levelUpMsg && (
        <div className="mb-6 bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-lg text-xs text-center animate-bounce shadow-lg shadow-yellow-400/20">
          {levelUpMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 pb-20">
        {/* Identity Section */}
        <div>
          <div className="flex justify-between items-center w-full">
            <SectionTitle icon={User}>Identidad</SectionTitle>
            {isMaster && (
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
                    onCheckedChange={(checked) => updateField('npc', checked)}
                    className="data-[state=checked]:bg-purple-600"
                  />
                </div>
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => updateField('visible', !formData.visible)}
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
                onChange={handleChange}
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
                onChange={handleChange}
                placeholder="Ej: El Valeroso"
                className="bg-gray-950 border-gray-800 focus:border-purple-500/50"
              />
            </div>
          </div>
        </div>

        {/* Origins Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] text-gray-500 uppercase font-black">
              Clase Principal {!formData.npc && '*'}
            </Label>
            <Select
              value={formData.char_class || ''}
              onValueChange={(val) => updateField('char_class', val)}
            >
              <SelectTrigger
                className={`w-full bg-gray-950 border-gray-800 ${errors.char_class ? 'border-red-500' : ''}`}
              >
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800 text-gray-100">
                {CLASES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.char_class && (
              <p className="text-[10px] text-red-400">{errors.char_class}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] text-gray-500 uppercase font-black">
              Clase Secundaria
            </Label>
            <Select
              value={formData.secondary_class || 'none'}
              onValueChange={(val) =>
                updateField('secondary_class', val === 'none' ? '' : val)
              }
            >
              <SelectTrigger className="w-full bg-gray-950 border-gray-800">
                <SelectValue placeholder="Opcional" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800 text-gray-100">
                <SelectItem value="none">Ninguna</SelectItem>
                {CLASES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] text-gray-500 uppercase font-black">
              Raza {!formData.npc && '*'}
            </Label>
            <Select
              value={formData.race || ''}
              onValueChange={(val) => updateField('race', val)}
            >
              <SelectTrigger
                className={`w-full bg-gray-950 border-gray-800 ${errors.race ? 'border-red-500' : ''}`}
              >
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800 text-gray-100">
                {RAZAS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.race && (
              <p className="text-[10px] text-red-400">{errors.race}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] text-gray-500 uppercase font-black">
              Alineamiento Moral {!formData.npc && '*'}
            </Label>
            <Select
              value={formData.alignment || ''}
              onValueChange={(val) => updateField('alignment', val)}
            >
              <SelectTrigger
                className={`w-full bg-gray-950 border-gray-800 ${errors.alignment ? 'border-red-500' : ''}`}
              >
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800 text-gray-100">
                {ALINEAMIENTOS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.alignment && (
              <p className="text-[10px] text-red-400">{errors.alignment}</p>
            )}
          </div>
        </div>

        {/* Level Progression */}
        <div>
          <SectionTitle icon={Sparkles}>Progresión</SectionTitle>
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] text-gray-500 uppercase font-black">
                Nivel Actual
              </Label>
              <Select
                value={String(formData.level)}
                onValueChange={(val) => updateField('level', val)}
              >
                <SelectTrigger className="w-full bg-gray-950 border-gray-800">
                  <SelectValue placeholder="Nivel" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800 text-gray-100">
                  {NIVELES.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      Nivel {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="experience"
                className="text-[10px] text-gray-500 uppercase font-black"
              >
                Experiencia (XP)
              </Label>
              <Input
                type="number"
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="bg-gray-950 border-gray-800 focus:border-purple-500/50"
              />
            </div>
          </div>
        </div>

        {/* Attributes Section */}
        <div>
          <SectionTitle icon={Shield}>Atributos</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              ['strength', 'Fuerza (FUE)'],
              ['dexterity', 'Destreza (DES)'],
              ['constitution', 'Constitución (CON)'],
              ['intelligence', 'Inteligencia (INT)'],
              ['wisdom', 'Sabiduría (SAB)'],
              ['charisma', 'Carisma (CAR)'],
            ].map(([key, lbl]) => (
              <div
                key={key}
                className="bg-gray-950 p-3 sm:p-4 rounded-xl border border-gray-800 flex flex-col items-center gap-2 transition-all hover:border-purple-500/30"
              >
                <div className="flex justify-between items-center w-full px-1 gap-1">
                  <Label
                    htmlFor={key}
                    className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-black truncate"
                  >
                    {lbl}
                  </Label>
                  <span className="text-purple-400 font-bold text-xs">
                    {mod(formData[key])}
                  </span>
                </div>
                <Input
                  type="number"
                  id={key}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  min={1}
                  max={30}
                  className="bg-gray-900 border-gray-800 text-center text-2xl font-bold w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Vital Resources */}
        <div>
          <SectionTitle icon={Zap}>Recursos Vitales</SectionTitle>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="hp"
                className="text-[10px] text-gray-500 uppercase font-black"
              >
                HP Actual
              </Label>
              <Input
                type="number"
                id="hp"
                name="hp"
                value={formData.hp}
                onChange={handleChange}
                className="bg-gray-950 border-gray-800 text-red-400 font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="max_hp"
                className="text-[10px] text-gray-500 uppercase font-black"
              >
                HP Máximo
              </Label>
              <Input
                type="number"
                id="max_hp"
                name="max_hp"
                value={formData.max_hp}
                onChange={handleChange}
                className="bg-gray-950 border-gray-800 font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="energy"
                className="text-[10px] text-gray-500 uppercase font-black"
              >
                Energía
              </Label>
              <Input
                type="number"
                id="energy"
                name="energy"
                value={formData.energy}
                onChange={handleChange}
                className="bg-gray-950 border-gray-800 text-blue-400 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Narrative Section */}
        <div>
          <SectionTitle icon={BookOpen}>Trasfondo</SectionTitle>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="background_story"
                className="text-[10px] text-gray-500 uppercase font-black"
              >
                Historia
              </Label>
              <Textarea
                id="background_story"
                name="background_story"
                value={formData.background_story}
                onChange={handleChange}
                placeholder="Narra los orígenes de tu personaje..."
                className="bg-gray-950 border-gray-800 min-h-[100px] text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="motivations"
                className="text-[10px] text-gray-500 uppercase font-black"
              >
                Motivaciones y Objetivos
              </Label>
              <Textarea
                id="motivations"
                name="motivations"
                value={formData.motivations}
                onChange={handleChange}
                placeholder="¿Qué impulsa a tu héroe a la aventura?"
                className="bg-gray-950 border-gray-800 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Sticky footer for submit */}
        <div className="sticky bottom-0 left-0 right-0 p-4 -mx-6 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 z-10 flex gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-purple-900 hover:bg-purple-700 text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            {loading
              ? 'Procesando...'
              : isEdit
                ? 'Guardar Cambios'
                : 'Crear Héroe'}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="destructive"
              onClick={onCancel}
              className="flex-1 bg-red-900/20 border-red-900/50 text-red-400 hover:bg-red-900/40 hover:text-red-300"
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </>
  );
};

export { CharacterForm };
