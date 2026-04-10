---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: Frontend Image Wizard & Miniatures

## Objective
Implement character image upload with cropping and display miniatures.

## Context
- frontend/src/components/CharacterForm.jsx
- frontend/src/pages/CharactersPage/CharacterCard/CharacterCard.jsx
- frontend/package.json

## Tasks

<task type="auto">
  <name>Install Cropping Dependencies</name>
  <files>frontend/package.json</files>
  <action>
    Install `react-easy-crop`.
  </action>
  <verify>npm list react-easy-crop</verify>
  <done>Dependency is installed.</done>
</task>

<task type="auto">
  <name>Create ImageCropper Component</name>
  <files>frontend/src/components/ImageCropper.jsx</files>
  <action>
    Create a reusable modal component using `react-easy-crop` to allow users to select a square area of an image.
  </action>
  <verify>Manual testing in dev environment.</verify>
  <done>Cropper component is functional.</done>
</task>

<task type="auto">
  <name>Integrate Upload in CharacterForm</name>
  <files>frontend/src/components/CharacterForm.jsx</files>
  <action>
    - Add a file input/avatar selector.
    - Trigger the Cropper when an image is selected.
    - Handle binary upload to the backend (multipart/form-data).
  </action>
  <verify>Upload an image and check if it persists in the backend.</verify>
  <done>Character avatars can be uploaded and saved.</done>
</task>

<task type="auto">
  <name>Display Miniatures in Character Cards</name>
  <files>frontend/src/pages/CharactersPage/CharacterCard/CharacterCard.jsx</files>
  <action>
    Update the `CharacterCard` to display the avatar in a small circle/square next to the name.
  </action>
  <verify>Characters with images show their miniatures.</verify>
  <done>Miniatures are visible in the character list.</done>
</task>

## Success Criteria
- [ ] Users can upload and crop images for their characters.
- [ ] Characters display their miniature avatars across the UI.
