---
phase: 6
plan: 1
wave: 1
---

# Plan 6.1: Processing Limitations & Bug Fixes

## Objective
Limit processing to one session at a time across the whole stack and fix the infinite notification bug.

## Context
- `docker-compose.yml`
- `rol/views.py`
- `frontend/src/pages/CodicePage/CodicePage.jsx`

## Tasks

<task type="auto">
  <name>Limit Worker Concurrency</name>
  <files>
    - docker-compose.yml
  </files>
  <action>
    - Add `--concurrency=1` to the Celery worker command.
  </action>
  <verify>grep "concurrency=1" docker-compose.yml</verify>
  <done>Worker is limited to 1 task at a time.</done>
</task>

<task type="auto">
  <name>Limit API Processing Endpoint</name>
  <files>
    - rol/views.py
  </files>
  <action>
    - In `ChroniclerViewSet.process`, check if ANY `ChronicleSession` exists with status `TRANSCRIBING` or `SUMMARIZING`.
    - If so, return a 400 error indicating that another session is already being processed.
  </action>
  <verify>Try to trigger processing on two sessions via API.</verify>
  <done>Backend prevents concurrent processing.</done>
</task>

<task type="auto">
  <name>Fix Frontend Bugs and Limit UI</name>
  <files>
    - frontend/src/pages/CodicePage/CodicePage.jsx
  </files>
  <action>
    - **Infinite Toast**: Add a `useEffect` or logic to ensure `toast.success` only fires once when a session transitions to `COMPLETED`. Use a ref or a state to track the "notified" status of the current session.
    - **UI Limiting**: Disable "Iniciar Procesamiento" buttons if ANY session in the `sessions` list is currently processing (checking `s.status`).
  </action>
  <verify>Receive only one notification when completed. Buttons are disabled while processing.</verify>
  <done>Frontend is bug-free and synchronized with processing limits.</done>
</task>

## Success Criteria
- [ ] Only one session can be processed at a time.
- [ ] No more infinite notifications.
