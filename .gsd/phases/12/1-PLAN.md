---
phase: 12
plan: 1
wave: 1
---

# Plan 12.1: Global SRD Infrastructure

## Objective
Establish the global state management for SRD details and set up the single-instance modal architecture.

## Context
- .gsd/SPEC.md
- frontend/src/context/SRDModalContext.jsx (to be created)
- frontend/src/App.jsx
- frontend/src/components/srd/SRDDetailModal/SRDDetailModal.jsx

## Tasks

<task type="auto">
  <name>Create SRD Modal Context</name>
  <files>
    - frontend/src/context/SRDModalContext.jsx
  </files>
  <action>
    Create a new context and hook `useSRDModal`.
    - State: `isOpen` (boolean), `type` (string), `index` (string).
    - Methods: `openModal(type, index)`, `closeModal()`, `changeView(type, index)`.
    - Ensure `changeView` updates the state without closing the modal if it's already open.
  </action>
  <verify>Check that the file exists and exports the expected hook and provider.</verify>
  <done>SRDModalProvider and useSRDModal are available for use.</done>
</task>

<task type="auto">
  <name>Integrate Global Provider and Modal</name>
  <files>
    - frontend/src/App.jsx
  </files>
  <action>
    - Wrap the application content with `SRDModalProvider`.
    - Add a single instance of `SRDDetailModal` inside the provider but outside the main routing if possible (or within `AppContent`).
    - Remove the need for props in `SRDDetailModal` as it will now consume the context.
  </action>
  <verify>Run the app and check for context errors.</verify>
  <done>App is wrapped in the provider and a global modal instance exists.</done>
</task>

<task type="auto">
  <name>Refactor Modal Shell</name>
  <files>
    - frontend/src/components/srd/SRDDetailModal/SRDDetailModal.jsx
  </files>
  <action>
    - Update `SRDDetailModal` to use `useSRDModal`.
    - Remove `isOpen`, `onClose`, `type`, `index` props.
    - Keep the `Dialog` and `ScrollArea` structure but placeholder the logic for views.
    - Move common components like `DataItem` and `TagList` to a separate `SRDCommon.jsx` within the same folder for reuse in views.
  </action>
  <verify>Check that the modal still opens via the new context (manually or via a test trigger).</verify>
  <done>SRDDetailModal is a context-consumer and modularized.</done>
</task>

## Success Criteria
- [ ] No context errors in the application.
- [ ] SRDDetailModal can be triggered from anywhere using the `useSRDModal` hook.
- [ ] Only one instance of the modal is rendered in the DOM.
