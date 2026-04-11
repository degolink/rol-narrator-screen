---
phase: 4
plan: 2
wave: 1
---

# Plan 4.2: API Refinement

## Objective
Filter the chronicles based on user role and session status, and implement the "Stop" control.

## Context
- `rol/views.py`

## Tasks

<task type="auto">
  <name>API Filtering and Status Control</name>
  <files>
    - rol/views.py
  </files>
  <action>
    - Update `ChroniclerViewSet.get_queryset`:
        - If user is DM: return all sessions desc.
        - Else: return only sessions where `status == "COMPLETED"`.
    - Modify `postpone` action to be named `stop` (or add a `stop` action and alias `postpone` to it for backward compatibility if needed, but the user asked to change the button).
    - The stop/postpone action should:
        - Revoke the Celery task by ID.
        - Set session status to `PAUSED`.
        - DO NOT reschedule with ETA.
  </action>
  <verify>Check view filtering and task revocation logic.</verify>
  <done>API correctly restricts access and stops tasks as requested.</done>
</task>

## Success Criteria
- [ ] Players cannot see pending sessions.
- [ ] Stopping a session doesn't reschedule it.
