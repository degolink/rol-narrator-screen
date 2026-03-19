import React, { useState } from 'react';
import api from '../api';
import { levelFromXp, minXpForLevel } from '../utils/levels';

// ─── D&D 5e valid values ───────────────────────────────────────────────────
const CLASES = [
  'Artífice', 'Bárbaro', 'Bardo', 'Brujo', 'Clérigo',
  'Druida', 'Explorador', 'Guerrero', 'Hechicero',
  'Mago', 'Monje', 'Paladín', 'Pícaro',
];

const RAZAS = [
  'Aasimar', 'Dracónido', 'Druida del Fuego', 'Elfo (Alto)',
  'Elfo (Bosque)', 'Elfo (Drow)', 'Enano (Colinas)', 'Enano (Montaña)',
  'Genasi (Agua)', 'Genasi (Aire)', 'Genasi (Fuego)', 'Genasi (Tierra)',
  'Gnomo (Bosque)', 'Gnomo (Rocas)', 'Humano',
  'Mediano (Fornido)', 'Mediano (Pie Ligero)',
  'Semielfo', 'Semiorco', 'Tiefling',
];

const ALINEAMIENTOS = [
  'Legal Bueno', 'Neutral Bueno', 'Caótico Bueno',
  'Legal Neutral', 'Neutral', 'Caótico Neutral',
  'Legal Malvado', 'Neutral Malvado', 'Caótico Malvado',
];

const NIVELES = Array.from({ length: 20 }, (_, i) => i + 1);

// D&D 5e mod
const mod = (score) => {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
};

// ─── Reusable field components ─────────────────────────────────────────────
const FIELD_CLS = 'w-full px-2 py-1.5 bg-gray-900 border border-gray-600 rounded text-gray-100 text-sm focus:outline-none focus:border-purple-500';

const Field = ({ label, name, value, type = 'text', onChange, required, error }) => (
  <div>
    <label className="block text-xs text-gray-400 mb-0.5">
      {label} {required && <span className="text-red-500 font-bold">*</span>}
    </label>
    {type === 'textarea' ? (
      <textarea name={name} value={value ?? ''} onChange={onChange} rows={2}
        className={`${FIELD_CLS} resize-y ${error ? 'border-red-500' : ''}`} />
    ) : (
      <input type={type} name={name} value={value ?? ''} onChange={onChange}
        className={`${FIELD_CLS} ${error ? 'border-red-500' : ''}`} />
    )}
    {error && <p className="text-[10px] text-red-400 mt-0.5">{error}</p>}
  </div>
);

const SelectField = ({ label, name, value, options, onChange, required, error }) => (
  <div>
    <label className="block text-xs text-gray-400 mb-0.5">
      {label} {required && <span className="text-red-500 font-bold">*</span>}
    </label>
    <select name={name} value={value ?? ''} onChange={onChange} 
      className={`${FIELD_CLS} ${error ? 'border-red-500' : ''}`}>
      <option value="">— Seleccionar —</option>
      {options.map(o => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
    {error && <p className="text-[10px] text-red-400 mt-0.5">{error}</p>}
  </div>
);

// Stat input that shows the modifier live
const StatField = ({ label, name, value, onChange }) => {
  const score = parseInt(value, 10) || 10;
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-0.5">
        {label} <span className="text-purple-400">{mod(score)}</span>
      </label>
      <input
        type="number" name={name} value={value ?? 10} onChange={onChange}
        className={FIELD_CLS + ' text-center'}
        min={1} max={30}
      />
    </div>
  );
};

// ─── Default form state ────────────────────────────────────────────────────
const EMPTY = {
  name: '', nickname: '', char_class: '', race: '', alignment: '',
  level: 1, experience: 0,
  strength: 10, dexterity: 10, constitution: 10,
  intelligence: 10, wisdom: 10, charisma: 10,
  hp: 10, max_hp: 10, energy: 0,
  background_story: '', motivations: '',
};

// Props:
//   character  — if provided → edit mode (PATCH); omit → create mode (POST)
//   onSaved(char) — called with saved character on success
const CharacterForm = ({ character, onSaved }) => {
  const isEdit = Boolean(character);
  const [formData, setFormData] = useState(character ? { ...character } : { ...EMPTY });
  const [levelUpMsg, setLevelUpMsg] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => {
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
      setFormData(prev => ({ ...prev, experience: xp, level: newLevel }));
      return;
    }

    // Level → correct XP into valid range
    if (name === 'level') {
      const newLevel = Math.max(1, Math.min(20, parseInt(value, 10) || 1));
      const currentXp = parseInt(formData.experience, 10) || 0;
      const minXp = minXpForLevel(newLevel);
      const nextMinXp = minXpForLevel(newLevel + 1);
      const correctedXp =
        currentXp < minXp ? minXp :
          newLevel < 20 && currentXp >= nextMinXp ? minXp :
            currentXp;
      setFormData(prev => ({ ...prev, level: newLevel, experience: correctedXp }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!formData.name) newErrors.name = 'El nombre es requerido';
    if (!formData.char_class) newErrors.char_class = 'La clase es requerida';
    if (!formData.race) newErrors.race = 'La raza es requerida';
    if (!formData.alignment) newErrors.alignment = 'El alineamiento es requerido';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = isEdit
        ? await api.patch(`characters/${character.id}/`, formData)
        : await api.post('characters/', formData);
      if (!isEdit) setFormData({ ...EMPTY });
      setErrors({});
      onSaved(response.data);
    } catch (err) {
      console.error('Error saving character', err);
    }
  };

  return (
    <>
      {levelUpMsg && (
        <div className="mb-4 bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-lg text-sm text-center animate-bounce">
          {levelUpMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Identity */}
        <div className="grid grid-cols-2 gap-3">
          <Field 
            label="Nombre" name="name" required 
            value={formData.name} onChange={handleChange} 
            error={errors.name} 
          />
          <Field label="Apodo" name="nickname" value={formData.nickname} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SelectField 
            label="Clase" name="char_class" required 
            value={formData.char_class} options={CLASES} onChange={handleChange} 
            error={errors.char_class} 
          />
          <SelectField 
            label="Raza" name="race" required 
            value={formData.race} options={RAZAS} onChange={handleChange} 
            error={errors.race} 
          />
        </div>

        <SelectField 
          label="Alineamiento" name="alignment" required
          value={formData.alignment} options={ALINEAMIENTOS} onChange={handleChange} 
          error={errors.alignment}
        />

        {/* Level & XP */}
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Nivel"
            name="level"
            value={String(formData.level)}
            options={NIVELES.map(String)}
            onChange={handleChange}
          />
          <Field label="Experiencia (XP)" name="experience" type="number" value={formData.experience} onChange={handleChange} />
        </div>

        {/* Attributes */}
        <div>
          <p className="text-xs text-yellow-300 font-bold uppercase tracking-wide mb-2">
            Atributos <span className="text-gray-500 normal-case font-normal">(el modificador se muestra en tiempo real)</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[['strength', 'FUE'], ['dexterity', 'DES'], ['constitution', 'CON'],
            ['intelligence', 'INT'], ['wisdom', 'SAB'], ['charisma', 'CAR']].map(([key, lbl]) => (
              <StatField key={key} label={lbl} name={key} value={formData[key]} onChange={handleChange} />
            ))}
          </div>
        </div>

        {/* Resources */}
        <div>
          <p className="text-xs text-yellow-300 font-bold uppercase tracking-wide mb-2">Recursos</p>
          <div className="grid grid-cols-3 gap-2">
            <Field label="HP Actual" name="hp" type="number" value={formData.hp} onChange={handleChange} />
            <Field label="HP Máx" name="max_hp" type="number" value={formData.max_hp} onChange={handleChange} />
            <Field label="Energía" name="energy" type="number" value={formData.energy} onChange={handleChange} />
          </div>
        </div>

        <Field label="Historia" name="background_story" type="textarea" value={formData.background_story} onChange={handleChange} />
        <Field label="Motivaciones" name="motivations" type="textarea" value={formData.motivations} onChange={handleChange} />

        <button type="submit"
          className="w-full bg-purple-900 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-sm">
          {isEdit ? 'Guardar cambios' : 'Crear personaje'}
        </button>
      </form>
    </>
  );
};

export default CharacterForm;
