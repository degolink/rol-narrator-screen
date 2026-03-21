# Project Guidelines for AI Agents

This project uses a Docker-based development environment. All commands related to dependencies, migrations, and running the application MUST be executed within the Docker containers.

## Core Services
- **Backend (Django)**: `rol_backend`
- **Frontend (Vite/React)**: `rol_frontend`
- **Database (PostgreSQL)**: `rol_db`

## Essential Commands

### Managing Dependencies
Do not run `npm install` or `uv` commands on your local host. Instead, use:

- **Frontend**:
  ```bash
  docker compose exec frontend npm install <package-name>
  ```
- **Backend (Python)**:
  ```bash
  docker compose exec backend uv add <package-name>
  ```
  *(This will update the project dependencies using `uv`)*

### Database Migrations
Always run migrations through the backend container:
```bash
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate
```

### Running the Project
The project is typically started using:
```bash
docker compose up --build
```

## Import Aliases
The frontend uses the `@/` alias pointing to `src/`. This is configured in `vite.config.js` and `jsconfig.json`.
Avoid using relative paths for deep imports; use `@/components/ui/...` instead.

## Notification System
We use **Sonner** for notifications via `shadcn/ui`. The native Toast component is deprecated and should not be used.
Global Toaster is already configured in `src/App.jsx`.
Use `apiService` from `src/services/apiService.js` for standardized requests with automatic notifications.

## Frontend Code Style Rules
- **No `export default`**: Use named exports exclusively (`export function Component() {}` or `export { Component }`) to ensure consistent naming and better refactoring support. Do not use `export default`.
- **Spanish Localization**: All content displayed on the pages must be in Spanish.
