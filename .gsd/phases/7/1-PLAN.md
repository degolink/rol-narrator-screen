---
phase: 7
plan: 1
wave: 1
---

# Plan 7.1: D&D 5e API Integration

## Objective
Integrate the `dnd5e-api` and `MongoDB` into the current Docker infrastructure, ensuring proper routing through Caddy, data persistence, and a one-time setup mechanism.

## Context
- `docker-compose.yml`
- `Caddyfile`
- `env.sample`
- `README.md`
- `start.sh` (as reference for `setup.sh`)

## Tasks

<task type="auto">
  <name>Configure Docker Services</name>
  <files>
    - docker-compose.yml
    - env.sample
  </files>
  <action>
    - Add `mongo:latest` service with a persistent volume `mongo_data`.
    - Add `dnd5eapi/dnd5eapi:latest` service (named `dnd5e-api`).
    - Configure `dnd5e-api` to depend on `mongo`.
    - Set `MONGODB_URI` in `dnd5e-api` environment.
    - Add `MONGODB_URI` to `env.sample` with a default value like `mongodb://mongo:27017/dnd5e`.
    - Ensure `gateway` (Caddy) depends on `dnd5e-api`.
  </action>
  <verify>docker compose config</verify>
  <done>
    - Mongo service is defined with volume.
    - dnd5e-api service is defined with correct environment and dependencies.
    - env.sample is updated.
  </done>
</task>

<task type="auto">
  <name>Route API through Caddy</name>
  <files>
    - Caddyfile
  </files>
  <action>
    - Add a `handle_path /dnd5e-api/*` block to the `Caddyfile`.
    - Proxy requests to `dnd5e-api:3000`.
    - Ensure it is placed before the generic frontend handle.
  </action>
  <verify>grep "/dnd5e-api/\*" Caddyfile</verify>
  <done>
    - Caddyfile correctly routes `/dnd5e-api/*` to the dnd5e-api container on port 3000.
  </done>
</task>

<task type="auto">
  <name>Create Setup Script and Update Documentation</name>
  <files>
    - setup.sh
    - README.md
  </files>
  <action>
    - Create `setup.sh` (executable):
      1. Load `.env`.
      2. Start `mongo` and `dnd5e-api` in detached mode.
      3. Wait for services to be ready.
      4. Run `docker compose exec dnd5e-api npm run db:refresh` (seeding command).
      5. Print success message.
    - Update `README.md`:
      - Mention the new `setup.sh` script for first-time SRD initialization.
      - Update the architecture diagram or service list if applicable.
  </action>
  <verify>
    - Check if setup.sh exists and is executable.
    - Verify README.md contains instructions for dnd5e-api.
  </verify>
  <done>
    - setup.sh is ready for use.
    - README.md is updated.
  </done>
</task>

## Success Criteria
- [ ] `docker-compose.yml` contains `mongo` and `dnd5e-api` services.
- [ ] `Caddyfile` routes `/dnd5e-api/*` to the new service.
- [ ] `setup.sh` is present and correctly structured for database initialization.
- [ ] `README.md` reflects these changes.
