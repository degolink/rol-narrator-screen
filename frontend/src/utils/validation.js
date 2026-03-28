import * as v from 'valibot';

/**
 * Character Schema for D&D 5e
 * Validates fields and provides localized error messages.
 */
export const CharacterSchema = v.pipe(
  v.object({
    name: v.pipe(v.string(), v.nonEmpty('El nombre es requerido')),
    nickname: v.optional(v.string()),
    npc: v.boolean(),
    char_class: v.string(),
    secondary_class: v.optional(v.string()),
    race: v.string(),
    alignment: v.string(),
    level: v.pipe(
      v.number('El nivel debe ser un número'),
      v.minValue(1, 'Mínimo nivel 1'),
      v.maxValue(20, 'Máximo nivel 20'),
    ),
    experience: v.pipe(
      v.number('La XP debe ser un número'),
      v.minValue(0, 'La XP no puede ser negativa'),
    ),
    strength: v.pipe(
      v.number('La fuerza debe ser un número'),
      v.minValue(1, 'Mínimo 1'),
      v.maxValue(30, 'Máximo 30'),
    ),
    dexterity: v.pipe(
      v.number('La destreza debe ser un número'),
      v.minValue(1, 'Mínimo 1'),
      v.maxValue(30, 'Máximo 30'),
    ),
    constitution: v.pipe(
      v.number('La constitución debe ser un número'),
      v.minValue(1, 'Mínimo 1'),
      v.maxValue(30, 'Máximo 30'),
    ),
    intelligence: v.pipe(
      v.number('La inteligencia debe ser un número'),
      v.minValue(1, 'Mínimo 1'),
      v.maxValue(30, 'Máximo 30'),
    ),
    wisdom: v.pipe(
      v.number('La sabiduría debe ser un número'),
      v.minValue(1, 'Mínimo 1'),
      v.maxValue(30, 'Máximo 30'),
    ),
    charisma: v.pipe(
      v.number('El carisma debe ser un número'),
      v.minValue(1, 'Mínimo 1'),
      v.maxValue(30, 'Máximo 30'),
    ),
    hp: v.pipe(
      v.number('La vida debe ser un número'),
      v.minValue(0, 'La vida no puede ser negativa'),
    ),
    max_hp: v.pipe(
      v.number('La vida máxima debe ser un número'),
      v.minValue(1, 'Mínimo 1 de vida máxima'),
    ),
    energy: v.pipe(
      v.number('La energía debe ser un número'),
      v.minValue(0, 'La energía no puede ser negativa'),
    ),
    background_story: v.optional(v.string()),
    motivations: v.optional(v.string()),
    visible: v.optional(v.boolean()),
  }),
  // Cross-field validation: HP <= Max HP
  v.forward(
    v.check(
      (input) => input.hp <= input.max_hp,
      'La vida actual no puede superar la vida máxima',
    ),
    ['hp'],
  ),
  // Conditional validation: Requirements if NOT NPC
  v.forward(
    v.check(
      (input) => input.npc || !!input.char_class,
      'La clase es requerida para héroes',
    ),
    ['char_class'],
  ),
  v.forward(
    v.check(
      (input) => input.npc || !!input.race,
      'La raza es requerida para héroes',
    ),
    ['race'],
  ),
  v.forward(
    v.check(
      (input) => input.npc || !!input.alignment,
      'El alineamiento es requerido para héroes',
    ),
    ['alignment'],
  ),
);

/**
 * Helper to validate character data and return a flat errors object.
 */
export function validateCharacter(data) {
  // Convert numeric strings to numbers for validation if necessary
  const processed = {
    ...data,
    level: Number(data.level),
    experience: Number(data.experience),
    strength: Number(data.strength),
    dexterity: Number(data.dexterity),
    constitution: Number(data.constitution),
    intelligence: Number(data.intelligence),
    wisdom: Number(data.wisdom),
    charisma: Number(data.charisma),
    hp: Number(data.hp),
    max_hp: Number(data.max_hp),
    energy: Number(data.energy),
  };

  const result = v.safeParse(CharacterSchema, processed);

  if (result.success) {
    return { success: true, errors: {} };
  }

  // Map Valibot issues to a simple key-value pair for component state
  const errors = {};
  result.issues.forEach((issue) => {
    // issue.path usually contains the field name if it's an object validation
    const path = issue.path?.[0]?.key;
    if (path) {
      errors[path] = issue.message;
    } else {
      // General error (like the v.check ones)
      errors._general = issue.message;
    }
  });

  return { success: false, errors };
}
