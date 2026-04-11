---
phase: 4
plan: 1
wave: 1
---

# Plan 4.1: Backend Foundations

## Objective
Add the `title` field to the `ChronicleSession` model and update the task logic to extract it from the AI summary.

## Context
- `rol/models.py`
- `rol/tasks.py`
- `rol/serializers.py`

## Tasks

<task type="auto">
  <name>Update Model and Serializer</name>
  <files>
    - rol/models.py
    - rol/serializers.py
  </files>
  <action>
    - Add `title = models.CharField(max_length=255, blank=True, null=True)` to `ChronicleSession` model.
    - Add `title` to `fields` in `ChronicleSessionSerializer`.
  </action>
  <verify>grep "title = models.CharField" rol/models.py</verify>
  <done>Model and serializer reflect the new title field.</done>
</task>

<task type="auto">
  <name>Extraction logic in summary task</name>
  <files>
    - rol/tasks.py
  </files>
  <action>
    - Modify `_generate_summary` to split the AI response.
    - The first line should be assigned to `session.title`.
    - The remaining lines should be assigned to `session.summary`.
    - Handle cases where the response might be empty or single-line.
  </action>
  <verify>Check tasks.py for title extraction code.</verify>
  <done>Task correctly populates both title and summary fields.</done>
</task>

## Success Criteria
- [ ] ChronicleSession has a title field.
- [ ] Processing a session results in both a title and a summary.
