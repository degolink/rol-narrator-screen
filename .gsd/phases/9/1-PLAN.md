# Phase 9: SRD Data Integration

## Objective
Replace hardcoded dropdown values (Classes, Races, Alignments) in the `CharacterForm` with dynamic data fetched from the internal `dnd5e-api`.

## Context
- `.gsd/SPEC.md`: Requirement 6 (SRD Integration)
- `frontend/src/components/CharacterForm/CharacterForm.constants.js`: To be partially deprecated
- `frontend/src/components/CharacterForm/OriginsSection.jsx`: Target component
- `Caddyfile`: API is proxied at `https://rol.local/dnd5e-api/api/2014/`

## Tasks

<task type="auto">
  <name>Create srdService</name>
  <files>
    - frontend/src/services/srdService.js
  </files>
  <action>
    - Create a new service `srdService` that fetches classes, races, and alignments from the `dnd5e-api`.
    - Provide methods like `getClasses()`, `getRaces()`, and `getAlignments()`.
    - Use `fetch` or the existing `apiService` patterns if applicable (though `apiService` is usually for the internal character/session API).
  </action>
  <verify>Call the service methods from the console or a test and verify they return data.</verify>
  <done>Service is functional and returns API data.</done>
</task>

<task type="auto">
  <name>Integrate dynamic data in CharacterForm</name>
  <files>
    - frontend/src/components/CharacterForm/OriginsSection.jsx
    - frontend/src/components/CharacterForm/index.jsx
  </files>
  <action>
    - Fetch the data in `CharacterForm` (index) using `srdService` within a `useEffect`.
    - Store the results in state and pass them down to `OriginsSection`.
    - Update `OriginsSection` to map over the dynamic data instead of the constants.
    - Use the `name` property from API results as the display value.
    - Provide fallback to constants if the API fails or is still loading.
  </action>
  <verify>Open the character creation page and verify the dropdowns are populated with data from srdService.</verify>
  <done>Dropdowns show data from the API via srdService.</done>
</task>

## Success Criteria
- [ ] Dropdowns for Race, Class, and Alignment are populated from `dnd5e-api`.
- [ ] UI remains in Spanish using a translation mapping for common SRD terms.
- [ ] Character creation still works with the new dynamic values.
