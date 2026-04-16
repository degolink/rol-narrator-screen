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
**Status**: ✅ Complete
**Objective**: Enable character creation and enforce the single-identity rule.
**Requirements**: REQ-01, REQ-02, REQ-03, REQ-04, REQ-06
- [x] Update Character model/views for player creation.
- [x] Implement backend "Active Character" check.
- [x] Update UI to handle DM-only visibility toggles.

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

### Phase 5: Technical Debt & Language Consistency
**Status**: ✅ Complete
**Objective**: Refactor codebase to use English naming conventions for models and internals while keeping Spanish for user-facing content.
- [ ] Rename Spanish models to English (VoiceProfile, ChronicleSession, TranscriptionFragment).
- [ ] Rename fields, variables, and internal constants to English.
- [ ] Update frontend to match new naming while maintaining Spanish UI labels.
- [ ] Ensure migrations are handled correctly.

### Phase 7: D&D 5e API Integration
**Status**: ✅ Complete
**Objective**: Integrate the official D&D 5e API locally into the Docker infrastructure.
- Add MongoDB and dnd5e-api services to docker-compose.
- Configure Caddy as a reverse proxy for the API.
- Create a setup script for data initialization.
- Update README with the new service details.

### Phase 8: Unified Character Management
**Status**: ✅ Complete
**Objective**: Replace character creation/editing drawers with a dedicated unified page.
- [x] Create unified character management page.
- [x] Update routes for character creation and editing.
- [x] Remove legacy drawers from Narrator Dashboard and Characters Page.

### Phase 9: SRD Data Integration
**Status**: ✅ Complete
**Objective**: Connect character form dropdowns to `dnd5e-api`.
- [x] Create `srdService` for data fetching.
- [x] Update `CharacterForm` dropdowns to use dynamic data.

### Phase 10: SRD Details & Index Selection
**Status**: ⬜ Planning Complete
**Objective**: Transition to index-based selection and add detail view functionality.
- [ ] Transition dropdowns to use SRD indices.
- [ ] Implement SRD Detail Modal.
- [ ] Add info buttons to character form labels.
