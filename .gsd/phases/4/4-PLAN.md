---
phase: 4
plan: 4
wave: 3
---

# Plan 4.4: Decommissioning & Data Cleanup

## Objective
Remove the old page and clean up broken session data.

## Context
- `frontend/src/App.jsx`
- `frontend/src/components/NavBar.jsx`
- `rol/migrations/`

## Tasks

<task type="auto">
  <name>Schema Migration and Data Cleanup</name>
  <files>
    - rol/migrations/0011_chronicle_session_title_and_cleanup.py
  </files>
  <action>
    - Add `title` field to `ChronicleSession`.
    - In the same migration, add a `RunPython` step to delete all existing sessions and fragments to satisfy the user's "borralos" request.
  </action>
  <verify>./manage.py migrate</verify>
  <done>Database is clean and schema is updated.</done>
</task>

<task type="auto">
  <name>Remove Legacy Page</name>
  <files>
    - frontend/src/App.jsx
    - frontend/src/components/NavBar.jsx
  </files>
  <action>
    - Remove the `/forja` route from `App.jsx`.
    - Remove "La Forja" from `NavBar.jsx`.
    - Delete the `frontend/src/pages/CronistForgePage` directory.
  </action>
  <verify>Check App.jsx and NavBar.jsx for removal.</verify>
  <done>Reference to Forja is gone.</done>
</task>

## Success Criteria
- [ ] No more "La Forja" in the UI.
- [ ] Database is clean.
