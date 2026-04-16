---
phase: 8
plan: 1
wave: 1
---

# Plan 8.1: Unified Character Management Page & Routing

## Objective
Create a unified page for character creation and editing that can be used by both the Narrator and Players, and set up the necessary routing.

## Context
- .gsd/SPEC.md
- frontend/src/App.jsx
- frontend/src/pages/CharacterPage.jsx (baseline, renamed from CharacterDetailsPage.jsx)
- frontend/src/components/CharacterForm/index.jsx

## Tasks

<task type="auto">
  <name>Rename and Extend CharacterPage.jsx</name>
  <files>
    <file>frontend/src/pages/CharacterDetailsPage.jsx</file>
    <file>frontend/src/pages/CharacterPage.jsx</file>
  </files>
  <action>
    - Rename `CharacterDetailsPage.jsx` to `CharacterPage.jsx`.
    - Modify the component to handle both "Edit" (existing ID) and "Create" (ID is 'nuevo') modes.
    - If `id === 'nuevo'`, skip character fetching and pass `null` to `CharacterForm`.
    - Add a "Back" button to return to the appropriate dashboard.
    - Update the header title dynamically.
    - Ensure `CharacterForm` redirects after successful creation.
  </action>
  <verify>Check that CharacterPage.jsx exists and handles both modes.</verify>
  <done>CharacterPage.jsx is the unified management page.</done>
</task>

<task type="auto">
  <name>Update Routes in App.jsx</name>
  <files>
    <file>frontend/src/App.jsx</file>
  </files>
  <action>
    - Add a new route `/personaje/nuevo` mapping to `CharacterPage`.
    - Update the existing `/personaje/:id` route to map to the renamed `CharacterPage`.
    - Update the import from `CharacterDetailsPage` to `CharacterPage`.
  </action>
  <verify>Check App.jsx for the new and updated routes and import.</verify>
  <done>Routes are configured correctly using CharacterPage.</done>
</task>

## Success Criteria
- [ ] Users can navigate to /personaje/nuevo to create a character.
- [ ] Users can navigate to /personaje/:id to edit a character.
- [ ] The management page uses the unified CharacterForm.
