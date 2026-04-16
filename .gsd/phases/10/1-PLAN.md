# Phase 10: SRD Details & Index Selection

## Objective
Transition character selection to use SRD indices instead of names and provide a way to view entity details (Class, Race, Alignment) directly from the character form.

## Context
- `frontend/src/services/srdService.js`: Needs detail fetching methods.
- `frontend/src/components/CharacterForm/OriginsSection.jsx`: Needs UI/UX updates for index-based selection and info buttons.
- `dnd5e-api`: Provides detailed endpoints at `/api/2014/{entity}/{index}`.

## Tasks

<task type="auto">
  <name>Update srdService with detail methods</name>
  <files>
    - frontend/src/services/srdService.js
  </files>
  <action>
    - Add `getClass(index)`, `getRace(index)`, and `getAlignment(index)` methods to `srdService`.
    - These should fetch from `/classes/{index}`, `/races/{index}`, and `/alignments/{index}` respectively.
  </action>
  <verify>Check service methods in console.</verify>
  <done>Service supports fetching individual SRD entities.</done>
</task>

<task type="auto">
  <name>Transition to index-based selection</name>
  <files>
    - frontend/src/components/CharacterForm/OriginsSection.jsx
  </files>
  <action>
    - Update `Select` components to use `item.index` as the `value` of `SelectItem`.
    - Ensure `formData` stores the index.
    - Update display logic to find the name from the index if needed (though `SelectValue` handle this if configured correctly).
  </action>
  <verify>Create a character and check that the DB stores indices (e.g., 'dragonborn') instead of names ('Dragonborn').</verify>
  <done>Character data uses SRD indices.</done>
</task>

<task type="auto">
  <name>Implement SRD Detail Modal</name>
  <files>
    - frontend/src/components/CharacterForm/OriginsSection.jsx
    - frontend/src/components/SRDDetailModal.jsx (New)
  </files>
  <action>
    - Create a reusable `SRDDetailModal` component that fetches and displays entity details.
    - Add an "Info" button (e.g., small Lucide `Info` icon) next to the labels in `OriginsSection` when a value is selected.
    - Connect the info button to open the modal with the selected index.
  </action>
  <verify>Select a class and click the info button; a modal should appear with class details (hit dice, proficiencies, etc.).</verify>
  <done>Users can view SRD details within the form.</done>
</task>

## Success Criteria
- [ ] Dropdowns store indices in the database.
- [ ] Info buttons appear for selected entites.
- [ ] Modal displays relevant SRD data (raw JSON initially or basic formatting).
