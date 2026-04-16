---
phase: 8
plan: 2
wave: 2
---

# Plan 8.2: Narrator Dashboard Migration

## Objective
Update the Narrator Dashboard to use the new management page and remove the legacy drawer.

## Context
- frontend/src/pages/NarratorDashboardPage/NarratorDashboardPage.jsx
- frontend/src/pages/NarratorDashboardPage/NarratorCharacterCard/NarratorCharacterCard.jsx
- frontend/src/pages/CharactersPage/CharactersPage.jsx

## Tasks

<task type="auto">
  <name>Update NarratorDashboardPage.jsx</name>
  <files>
    <file>frontend/src/pages/NarratorDashboardPage/NarratorDashboardPage.jsx</file>
  </files>
  <action>
    - Remove `CharactersDrawer` import and usage.
    - Update `openCreate` to navigate to `/personaje/nuevo` instead of setting drawer mode.
    - Update `openEdit` to navigate to `/personaje/:id` instead of setting drawer mode.
    - Remove state variables and callbacks related to the drawer (`drawerMode`, `editingCharacter`, `drawerOpen`, `closeDrawer`).
    - Remove the `useEffect` that kept `editingCharacter` in sync.
  </action>
  <verify>Check NarratorDashboardPage.jsx for removal of drawer logic and correctly implemented navigation.</verify>
  <done>Narrator Dashboard now handles character creation and editing via navigation.</done>
</task>

<task type="auto">
  <name>Update CharactersPage.jsx</name>
  <files>
    <file>frontend/src/pages/CharactersPage/CharactersPage.jsx</file>
  </files>
  <action>
    - Remove `Sheet` and its related sub-components (`SheetContent`, `SheetDescription`, etc.) from UI and imports.
    - Update the "Nuevo Personaje" button to be a simple link/button that navigates to `/personaje/nuevo`.
    - Remove the `isSheetOpen` state and `handleCreated` callback if they are no longer needed.
  </action>
  <verify>Check CharactersPage.jsx for removal of the Sheet component and redirection to the new page.</verify>
  <done>Characters Page now navigates to the management page for creating new characters.</done>
</task>

<task type="auto">
  <name>Cleanup Legacy Components</name>
  <files>
    <file>frontend/src/pages/NarratorDashboardPage/CharactersDrawer.jsx</file>
  </files>
  <action>
    - Delete `frontend/src/pages/NarratorDashboardPage/CharactersDrawer.jsx` as it is no longer used.
  </action>
  <verify>Check that the file no longer exists.</verify>
  <done>Legacy drawer component is removed.</done>
</task>

## Success Criteria
- [ ] Clicking "Nuevo Personaje" on any page navigates to /personaje/nuevo.
- [ ] Clicking "Editar" on a character card navigates to /personaje/:id.
- [ ] No traces of character management drawers remain in the codebase.
