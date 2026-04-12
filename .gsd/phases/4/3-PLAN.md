---
phase: 4
plan: 3
wave: 2
---

# Plan 4.3: Frontend Unification

## Objective
Integrate the management controls into the Codice page and improve session display.

## Context
- `frontend/src/pages/CodicePage/CodicePage.jsx`
- `frontend/src/pages/CodicePage/components/SessionSidebar.jsx`
- `frontend/src/pages/CodicePage/components/SessionSummary.jsx`
- `frontend/src/pages/CronistForgePage/components/CronistStatusCard.jsx` (Reference)

## Tasks

<task type="auto">
  <name>Create ChroniclerManagement Component</name>
  <files>
    - frontend/src/pages/CodicePage/components/ChroniclerManagement.jsx
  </files>
  <action>
    - Build a compact management component for DMs.
    - Show processing progress bar and status.
    - Provide "Start Processing" (if WAITING/PAUSED/COMPLETED) and "Stop" (if TRANSCRIBING/SUMMARIZING) buttons.
    - Connect to WebSocket for real-time updates (can be handled in the parent and passed down).
  </action>
  <verify>Component exists and receives props for status and controls.</verify>
  <done>Management component is ready for integration.</done>
</task>

<task type="auto">
  <name>Integrate Controls into CodicePage</name>
  <files>
    - frontend/src/pages/CodicePage/CodicePage.jsx
    - frontend/src/pages/CodicePage/components/SessionSidebar.jsx
    - frontend/src/pages/CodicePage/components/SessionSummary.jsx
  </files>
  <action>
    - Add WebSocket progress hook to `CodicePage`.
    - Inject `ChroniclerManagement` above `SessionSummary` ONLY for DMs.
    - Update `SessionSidebar` to show status badges for DMs.
    - Update `SessionSidebar` to use `title` field.
    - Update `SessionSummary` to use `title` field as heading.
  </action>
  <verify>selected session can be managed by DM directly in the Codice page.</verify>
  <done>Codice page now handles both viewing and management.</done>
</task>

## Success Criteria
- [ ] DMs can start/stop processing from Codice page.
- [ ] Session titles are displayed correctly.
- [ ] Sidebar shows status indicators for DMs.
