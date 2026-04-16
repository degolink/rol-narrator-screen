---
phase: 12
plan: 2
wave: 2
---

# Plan 12.2: Modular SRD Views

## Objective
Extract SRD entity-specific rendering into self-contained components that handle their own data fetching.

## Context
- frontend/src/components/srd/SRDDetailModal/SRDDetailModal.jsx
- frontend/src/components/srd/SRDDetailModal/views/ (to be created)

## Tasks

<task type="auto">
  <name>Extract SRD Views</name>
  <files>
    - frontend/src/components/srd/SRDDetailModal/views/SRDClassView.jsx
    - frontend/src/components/srd/SRDDetailModal/views/SRDRaceView.jsx
    - frontend/src/components/srd/SRDDetailModal/views/SRDAlignmentView.jsx
  </files>
  <action>
    - Extract the rendering logic for `class`, `race`, and `alignment` from `SRDDetailModal.jsx`.
    - Each component should take `index` as a prop.
    - Each component should use `useEffect` and `srdService` to fetch its own data.
    - Use common components from `SRDCommon.jsx`.
  </action>
  <verify>Ensure each view component renders correctly when provided with a valid index.</verify>
  <done>Individual views are created and self-contained.</done>
</task>

<task type="auto">
  <name>Update Modal Switch Logic</name>
  <files>
    - frontend/src/components/srd/SRDDetailModal/SRDDetailModal.jsx
  </files>
  <action>
    - Replace the inline `renderClass`, `renderRace`, etc., with the new modular view components.
    - Implement a mapping object to select the correct view based on the current `type`.
  </action>
  <verify>Check that the modal displays the correct view when opened with different types.</verify>
  <done>SRDDetailModal dynamically renders the appropriate specialized view.</done>
</task>

## Success Criteria
- [ ] SRDDetailModal code size is significantly reduced.
- [ ] Each view independently fetches its data.
- [ ] Adding a new SRD type only requires adding a new view component.
