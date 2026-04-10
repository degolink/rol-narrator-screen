# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
Deepen the connection between players and their personas by allowing character self-management, enforcing a single identity for better voice identification, and adding visual personality through character images.

## Goals
1. **Character Self-Service**: Enable regular users (Players) to create and manage their own characters.
2. **Visual Identity**: Support character image uploads with a square-cropping wizard, automated compression, and miniature display across the app.
3. **Strict Identity Enforcement**: Implement a "One Active Character" rule for non-DM users to stabilize session identity.
4. **Optimized Speaker Identification**: Refine the voice diarization pipeline to prioritize matches within the active character pool.
5. **Session Data Integrity**: Ensure session names are properly auto-generated during transcription and correctly displayed in the Codice.

## Non-Goals (Out of Scope)
- Deleting characters (soft delete or archive not required yet).
- Advanced image filters or editing beyond cropping.
- Changing character visibility for non-DM users.

## Users
- **DMs**: Full control over character visibility; manage all session data; cannot select a character identity.
- **Players**: Can create characters; select exactly one character at a time; upload personal character art.

## Constraints
- **Technical**: Image sizes must be capped at 5MB; final storage format should be optimized (WebP/JPEG).
- **Architecture**: Stick to existing Django media patterns; leverage Celery for background processing.
- **Identity**: Identification scores must exceed a threshold before branding a segment as a specific character.

## Success Criteria
- [ ] Players can create a character and see it in the session list by default.
- [ ] A square-crop wizard successfully handles image uploads and saves to `/media/character_images/`.
- [ ] Attempting to select a second character triggers a guiding Toast notification.
- [ ] The "Sesión sin titulo" bug is resolved with working auto-generation.
- [ ] Chronicler diarization accurately maps segments to the single active user/character pair.
