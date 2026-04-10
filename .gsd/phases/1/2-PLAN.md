---
phase: 1
plan: 2
wave: 1
---

# Plan 1.2: Frontend Creation Flow & Selection UX

## Objective
Enable character creation for players and improve the identity selection user experience with Toast notifications.

## Context
- .gsd/SPEC.md
- frontend/src/pages/CharactersPage/CharactersPage.jsx
- frontend/src/pages/CharactersPage/CharacterCard/CharacterCard.jsx
- frontend/src/context/UserContext.jsx

## Tasks

<task type="auto">
  <name>Implement Character Creation UI</name>
  <files>
    frontend/src/pages/CharactersPage/CharactersPage.jsx
    frontend/src/services/characterService.js
  </files>
  <action>
    - Add a "Crear Nuevo Personaje" button to the `CharactersPage`.
    - Implement a minimal creation form/modal with required fields: Name, Class, Race, Alignment.
    - Set `visible=True` and `npc=False` by default for new player-created characters.
    - Automatically assign the new character as "active" if the user has no current selection.
  </action>
  <verify>Manual visual verification of the creation button and form logic.</verify>
  <done>Users can successfully create a new character from the UI.</done>
</task>

<task type="auto">
  <name>Add Identity Restriction Toasts</name>
  <files>
    frontend/src/pages/CharactersPage/CharactersPage.jsx
    frontend/src/context/UserContext.jsx
  </files>
  <action>
    - Update `assignCharacterToUser` call in the UI to handle the 400 error from Plan 1.1.
    - If assignment fails due to already having a character, display a Toast: "Ya tienes un personaje seleccionado. Cámbialo en tu perfil."
    - Ensure success assignments also trigger a specific "Personaje [Nombre] asignado" success toast.
  </action>
  <verify>Triggering character assignment in the browser and observing toasts.</verify>
  <done>User receives helpful feedback when trying to exceed the one-character limit.</done>
</task>

## Success Criteria
- [ ] Players can expand the character pool by creating their own heroes.
- [ ] UI provides clear feedback on identity restrictions.
- [ ] The "Visible by Default" requirement is honored for new characters.
