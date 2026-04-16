# Phase 11: Premium SRD Detail UI

## Objective
Create a high-fidelity, user-friendly modal for viewing SRD entity details. Replace the generic key-value iteration with specialized, beautifully formatted sections for Classes, Races, and Alignments.

## Context
- `frontend/src/components/SRDDetailModal.jsx`: Target for the refactor.
- `dnd5e-api`: Provides detailed data structures for Classes, Races, and Alignments.

## Tasks

<task type="auto">
  <name>Design specialized rendering logic for SRD types</name>
  <files>
    - frontend/src/components/SRDDetailModal.jsx
  </files>
  <action>
    - Create a map of specialized renderers based on `type`.
    - **Class Renderer**: Focus on Hit Die, Saving Throws, and Proficiencies.
    - **Race Renderer**: Focus on Ability Bonuses, Speed, and Traits.
    - **Alignment Renderer**: Focus on a clean, readable description block.
    - **Shared UI**: Rich typography, better use of space, and themed icons (Lucide).
  </action>
  <verify>Open the modal for a class, race, and alignment. Ensure they each have a unique, polished layout.</verify>
  <done>SRD details are easy to read and visually appealing.</done>
</task>

<task type="auto">
  <name>Implement "Quick Stats" and "Lore" sections</name>
  <files>
    - frontend/src/components/SRDDetailModal.jsx
  </files>
  <action>
    - Add a "Quick Stats" header for each type (e.g., "d12" in a large font for Barbarian Hit Die).
    - Format long descriptions (like Race age or Alignment desc) with proper line height and spacing.
    - Use themed colors (e.g., gold/yellow for accents).
  </action>
  <verify>Check that long text blocks are readable and not cramped.</verify>
  <done>Modal has a premium feel with clear information hierarchy.</done>
</task>

## Success Criteria
- [ ] No raw "key: value" dumps for primary data.
- [ ] Meaningful icons for stats (e.g., Heart for HP, Shoe for Speed).
- [ ] Specialized layouts for different SRD entry types.
