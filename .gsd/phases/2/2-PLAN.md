---
phase: 2
plan: 2
wave: 1
---

# Plan 2.2: Image Upload API

## Objective
Implement binary upload support in the Character API.

## Context
- .gsd/SPEC.md
- rol/serializers.py
- rol/views.py

## Tasks

<task type="auto">
  <name>Update Character Serializers</name>
  <files>rol/serializers.py</files>
  <action>
    Include the `image` field in `CharacterSerializer`.
    Ensure it handles `ImageField` correctly for multipart/form-data.
  </action>
  <verify>Check API documentation or serializer fields.</verify>
  <done>Serializer supports the image field.</done>
</task>

<task type="auto">
  <name>Expose Image in Participants API</name>
  <files>rol/serializers.py</files>
  <action>
    Ensure `CharacterMiniSerializer` (if exists) or the participant info includes the absolute image URL so the frontend can display tiny miniatures.
  </action>
  <verify>GET /api/profile/participants/ shows image URLs.</verify>
  <done>Character miniatures are available in the participants list.</done>
</task>

## Success Criteria
- [ ] API accepts image uploads.
- [ ] Character data includes valid media URLs.
