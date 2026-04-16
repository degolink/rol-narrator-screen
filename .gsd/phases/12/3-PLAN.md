---
phase: 12
plan: 3
wave: 3
---

# Plan 12.3: Internal Navigation & Cleanup

## Objective
Enable seamless navigation within the modal and remove redundant local state management.

## Context
- frontend/src/components/srd/SRDDetailModal/SRDLink.jsx (to be created)
- frontend/src/components/CharacterForm/OriginsSection.jsx

## Tasks

<task type="auto">
  <name>Implement SRD Link Component</name>
  <files>
    - frontend/src/components/srd/SRDDetailModal/SRDLink.jsx
  </files>
  <action>
    - Create a component that renders a clickable element (button or badge).
    - It should take `name`, `index`, and `type`.
    - On click, it should call `useSRDModal().changeView(type, index)`.
  </action>
  <verify>Ensure clicking an SRDLink updates the modal content without closing it.</verify>
  <done>SRDLink is available and functional.</done>
</task>

<task type="auto">
  <name>Cleanup Call Sites</name>
  <files>
    - frontend/src/components/CharacterForm/OriginsSection.jsx
  </files>
  <action>
    - Remove local `detailConfig` state and `SRDDetailModal` instance.
    - Update info buttons to use `useSRDModal().openModal(type, index)`.
  </action>
  <verify>Check that the character form still triggers the modal but via context.</verify>
  <done>Local modal instances are removed and replaced by hook calls.</done>
</task>

<task type="auto">
  <name>Enhance Views with Internal Links</name>
  <files>
    - frontend/src/components/srd/SRDDetailModal/views/*.jsx
  </files>
  <action>
    - Replace raw text or static badges with `SRDLink` for features that have an index (e.g., traits in race view, subclasses in class view).
  </action>
  <verify>Test navigation from a Race view to a Trait (if available) or similar.</verify>
  <done>Internal navigation is enabled within the modal content.</done>
</task>

## Success Criteria
- [ ] Users can navigate between related SRD entities without leaving the modal.
- [ ] No local modal state remains in `OriginsSection.jsx`.
- [ ] UI remains consistent and high-fidelity.
