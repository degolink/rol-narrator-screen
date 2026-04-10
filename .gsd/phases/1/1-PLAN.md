---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Backend Identity Restriction & Permissions

## Objective
Enforce the "One Active Character" rule on the backend and secure character editing permissions.

## Context
- .gsd/SPEC.md
- rol/models.py
- rol/views.py
- rol/serializers.py

## Tasks

<task type="auto">
  <name>Restrict Multi-Character Assignment</name>
  <files>rol/views.py</files>
  <action>
    Modify `ProfileViewSet.assign_character` to prevent a non-DM user from claiming a second character if they already have one assigned.
    - If user already has `Character.objects.filter(player=user).exists()`, return a 400 error with a specific message: "Ya tienes un personaje asignado. Libéralo o cámbialo en tu perfil."
    - Ensure DMs are exempt from this restriction.
  </action>
  <verify>pytest rol/tests/test_profile.py</verify>
  <done>Attempting to assign a second character to a player returns 400 Bad Request.</done>
</task>

<task type="auto">
  <name>Implement Character Edit Permissions</name>
  <files>rol/views.py</files>
  <action>
    Update `CharacterViewSet` to enforce read/write rules:
    - DM: Full access to all.
    - Players (Authenticated): 
        - Read: All visible characters (`visible=True`).
        - Update: Any character where `visible=True` and `npc=False` (Main Characters).
    - Use a custom permission class `CharacterPermissions` or override `get_permissions`.
  </action>
  <verify>python manage.py test rol.tests.test_characters</verify>
  <done>Regular users can only update visible main characters; NPCs and hidden characters remain DM-only.</done>
</task>

## Success Criteria
- [ ] Users cannot claim more than one character identity simultaneously.
- [ ] Main characters are collaboratively editable by all players if visible.
- [ ] NPCs and hidden assets remain protected/DM-only.
