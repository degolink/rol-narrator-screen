---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Media Service & Image Logic

## Objective
Prepare the backend for character image storage and processing.

## Context
- .gsd/SPEC.md
- rol/models.py
- requirements.txt
- rol_narrator_screen/settings.py

## Tasks

<task type="auto">
  <name>Install Pillow Dependency</name>
  <files>requirements.txt</files>
  <action>
    Add `Pillow>=10.0.0` to `requirements.txt`.
  </action>
  <verify>docker compose exec backend pip install -r requirements.txt</verify>
  <done>Pillow is listed in requirements.</done>
</task>

<task type="auto">
  <name>Update Character Model for Images</name>
  <files>rol/models.py</files>
  <action>
    - Add `image = models.ImageField(upload_to="characters/avatars/", null=True, blank=True)` to the `Character` model.
    - Create a storage folder `media/characters/avatars/`.
  </action>
  <verify>python manage.py makemigrations && python manage.py migrate</verify>
  <done>Character model has an image field and database is migrated.</done>
</task>

<task type="auto">
  <name>Implement Server-Side Image Processing</name>
  <files>rol/models.py</files>
  <action>
    Override `save()` in the `Character` model or add a helper to:
    - Automatically square-crop the image if it is not square.
    - Resize to a maximum of 512x512 pixels to save space.
    - Convert to WebP for better compression.
  </action>
  <verify>Manual verification with image upload via Admin or shell.</verify>
  <done>Uploaded images are automatically processed into optimized square WebP files.</done>
</task>

## Success Criteria
- [ ] Backend supports image uploads for characters.
- [ ] Images are automatically optimized and cropped to 1:1 aspect ratio.
- [ ] Media files are correctly served.
