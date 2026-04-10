# ROADMAP.md

> **Current Phase**: Phase 1
> **Milestone**: v1.1 - Identity & Vision

## Must-Haves (from SPEC)
- [ ] Character creation for regular users.
- [ ] Strict one-character-per-user enforcement.
- [ ] Image upload with cropping and miniatures.
- [ ] Fixed session name auto-generation.

## Phases

### Phase 1: Foundation & Identity Logic
**Status**: ⬜ Not Started
**Objective**: Enable character creation and enforce the single-identity rule.
**Requirements**: REQ-01, REQ-02, REQ-03, REQ-04, REQ-06
- Update Character model/views for player creation.
- Implement backend "Active Character" check.
- Update UI to handle DM-only visibility toggles.

### Phase 2: Visual Identity & Media Service
**Status**: ⬜ Not Started
**Objective**: Backend image processing and storage.
**Requirements**: REQ-07, REQ-09
- Setup image compression/conversion service (Pillow).
- Implement image upload endpoint with resize/crop logic.
- Migration for character image field.

### Phase 3: Frontend Polish & Wizard
**Status**: ⬜ Not Started
**Objective**: Build the cropping wizard and integrate miniatures.
**Requirements**: REQ-05, REQ-08, REQ-10
- Implement the React cropping wizard.
- Update character cards to display miniatures.
- Add Toast notifications for identity changes.

### Phase 4: Chronicler Intelligence & Bug Fixes
**Status**: ⬜ Not Started
**Objective**: Fix session names and optimize diaries.
**Requirements**: REQ-11, REQ-12, REQ-13
- Debug and fix session title auto-generation.
- Optimize diarization task to use the active character pool.
- Implement score thresholding for speaker matching.
