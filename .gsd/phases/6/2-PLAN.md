---
phase: 6
plan: 2
wave: 2
---

# Plan 6.2: Display Fixes & Verification

## Objective
Fix the display of Epic Title, Summary, and Hero Path.

## Context
- `rol/tasks.py`
- `frontend/src/pages/CodicePage/CodicePage.jsx`
- `frontend/src/pages/CodicePage/components/SessionSidebar.jsx`

## Tasks

<task type="auto">
  <name>Verify and Fix Title/Summary Generation</name>
  <files>
    - rol/tasks.py
  </files>
  <action>
    - Add logging to see AI response.
    - Ensure `_generate_summary` prompt is strictly followed.
    - Consider using a more robust split (e.g., regex for multiple newlines) if AI output is messy.
  </action>
  <verify>Process a session and check title/summary in DB.</verify>
  <done>Backend saves correct data.</done>
</task>

<task type="auto">
  <name>Frontend Display Improvements</name>
  <files>
    - frontend/src/pages/CodicePage/CodicePage.jsx
    - frontend/src/pages/CodicePage/components/SessionSidebar.jsx
  </files>
  <action>
    - Ensure `selectedSession` is updated correctly when a session completes.
    - Check if `fragments` are being passed to `HeroPath` correctly. (In `CodicePage.jsx`, `selectedSession` might need to be refreshed with fragments after completion).
  </action>
  <verify>Titles, summaries, and paths appear after processing.</verify>
  <done>Frontend displays all chronicle components.</done>
</task>

## Success Criteria
- [ ] Titles and summaries are visible.
- [ ] Hero Path is populated if fragments exist.
