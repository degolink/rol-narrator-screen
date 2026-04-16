import React, { useState, useEffect, useCallback, useRef } from 'react';
import { dequal } from 'dequal';
import { apiService } from '../../services/apiService';
import { levelFromXp, minXpForLevel } from '../../utils/levels';
import { validateCharacter } from '../../utils/validation';
import { useUser } from '../../context/UserContext';
import { ImageCropper } from '../ImageCropper';
import { Button } from '@/components/ui/button';

// Sub-components
import { AvatarSection } from './AvatarSection';
import { IdentitySection } from './IdentitySection';
import { OriginsSection } from './OriginsSection';
import { ProgressionSection } from './ProgressionSection';
import { AttributesSection } from './AttributesSection';
import { VitalResourcesSection } from './VitalResourcesSection';
import { MonetarySection } from './MonetarySection';
import { NarrativeSection } from './NarrativeSection';
import { EMPTY_CHARACTER } from './CharacterForm.constants';

export function CharacterForm({ character, close }) {
  const { isDungeonMaster } = useUser();

  const isEdit = Boolean(character);
  const [formData, setFormData] = useState(
    character
      ? { ...character }
      : {
          ...EMPTY_CHARACTER,
          visible: !isDungeonMaster,
        },
  );

  const [levelUpMsg, setLevelUpMsg] = useState(null);
  const [errors, setErrors] = useState({});
  const [isCropping, setIsCropping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const formDataRef = useRef(formData);
  const characterRef = useRef(character);
  const isEditRef = useRef(isEdit);
  const lastSyncDataRef = useRef(null);

  // Keep refs up-to-date for the unmount hook
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    characterRef.current = character;
  }, [character]);

  useEffect(() => {
    isEditRef.current = isEdit;
  }, [isEdit]);

  // Flush pending saves on unmount
  useEffect(() => {
    return () => {
      if (isEditRef.current && characterRef.current && formDataRef.current) {
        if (!dequal(formDataRef.current, characterRef.current)) {
          const { success } = validateCharacter(formDataRef.current);
          if (success) {
            apiService
              .patch(
                `characters/${characterRef.current.id}/`,
                formDataRef.current,
              )
              .catch((err) =>
                console.error('Error auto-saving on unmount', err),
              );
          }
        }
      }
    };
  }, []);

  // 1. Remote Sync: Update form if character changes from WebSocket (Narrator/other)
  useEffect(() => {
    if (character) {
      if (
        !lastSyncDataRef.current ||
        !dequal(character, lastSyncDataRef.current)
      ) {
        setFormData(character);
        lastSyncDataRef.current = character;
      }
    }
  }, [character]);

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

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedFile) => {
    setFormData((prev) => ({ ...prev, image: croppedFile }));
    setIsCropping(false);
    setSelectedImage(null);
    if (isEdit) {
      await saveChanges({ ...formData, image: croppedFile });
    }
  };

  const removeImage = () => {
    updateField('image', null);
    if (isEdit) {
      saveChanges({ ...formData, image: null });
    }
  };

  // 2. Auto-save triggers
  const saveChanges = useCallback(async (customData) => {
    if (!isEditRef.current) return;
    const currentData = customData || formDataRef.current;
    const currentChar = characterRef.current;

    const { success, errors: newErrors } = validateCharacter(currentData);
    if (!success) {
      setErrors(newErrors);
      return;
    }

    try {
      lastSyncDataRef.current = { ...currentData };

      let dataToSubmit = currentData;
      let headers = {};

      if (currentData.image instanceof File) {
        dataToSubmit = new FormData();
        Object.entries(currentData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            dataToSubmit.append(key, value);
          }
        });
        headers = { 'Content-Type': 'multipart/form-data' };
      }

      await apiService.patchWithNotify(
        `characters/${currentChar.id}/`,
        dataToSubmit,
        'Cambios guardados',
        { headers },
        {
          duration: 1000,
          position: 'top-right',
          className: 'text-xs p-2 min-h-0',
        },
      );
    } catch (err) {
      console.error('Error auto-saving character', err);
    }
  }, []);

  useEffect(() => {
    if (!isEdit) return;

    const hasChanged = !dequal(formData, character);

    if (hasChanged) {
      const timer = setTimeout(() => {
        saveChanges();
      }, 1000); // 1s debounce
      return () => clearTimeout(timer);
    }
  }, [formData, isEdit, character, saveChanges]);

  const handleCreate = async (e) => {
    if (e) e.preventDefault();
    if (isEdit) return;

    const { success, errors: newErrors } = validateCharacter(formData);

    if (!success) {
      setErrors(newErrors);
      return;
    }

    try {
      let dataToSubmit = formData;
      let headers = {};

      if (formData.image instanceof File) {
        dataToSubmit = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            dataToSubmit.append(key, value);
          }
        });
        headers = { 'Content-Type': 'multipart/form-data' };
      }

      const response = await apiService.postWithNotify(
        'characters/',
        dataToSubmit,
        '¡Héroe creado con éxito!',
        { headers },
      );
      setErrors({});
      if (close) close(response.data);
    } catch (err) {
      console.error('Error creating character', err);
    }
  };

  return (
    <>
      {levelUpMsg && (
        <div className="mb-6 bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-lg text-xs text-center animate-bounce shadow-lg shadow-yellow-400/20">
          {levelUpMsg}
        </div>
      )}

      <form onSubmit={handleCreate} className="space-y-6 pb-20">
        {errors._general && (
          <div className="p-3 bg-red-900/30 border border-red-900/50 rounded-lg text-red-200 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-300">
            <span className="block mb-1 opacity-70 uppercase tracking-widest text-[10px]">
              Error de Validación
            </span>
            {errors._general}
          </div>
        )}

        <AvatarSection
          image={formData.image}
          onImageSelect={handleImageSelect}
          onRemoveImage={removeImage}
          fileInputRef={fileInputRef}
        />

        <IdentitySection
          formData={formData}
          errors={errors}
          isDungeonMaster={isDungeonMaster}
          onChange={handleChange}
          onUpdateField={updateField}
        />

        <OriginsSection
          formData={formData}
          errors={errors}
          onUpdateField={updateField}
        />

        <ProgressionSection
          formData={formData}
          errors={errors}
          onChange={handleChange}
          onUpdateField={updateField}
        />

        <AttributesSection
          formData={formData}
          errors={errors}
          onChange={handleChange}
        />

        <VitalResourcesSection
          formData={formData}
          errors={errors}
          onChange={handleChange}
        />

        <MonetarySection
          formData={formData}
          onUpdateField={updateField}
          isEdit={isEdit}
        />

        <NarrativeSection formData={formData} onChange={handleChange} />

        {!isEdit && (
          <div className="sticky bottom-0 left-0 right-0 p-4 -mx-6 bg-[#0c0c0e]/95 backdrop-blur-md border-t border-white/5 z-10 flex gap-4">
            <Button type="submit" size="lg" className="flex-1">
              Crear Personaje
            </Button>
          </div>
        )}
      </form>

      {isCropping && (
        <ImageCropper
          image={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setIsCropping(false);
            setSelectedImage(null);
          }}
        />
      )}
    </>
  );
}
