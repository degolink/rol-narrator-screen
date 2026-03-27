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

## Global Configuration
All global environment-independent configuration variables, such as dynamically constructed WebSocket URLs or foundational API base parameters, must be placed in `src/config.js`. Do not inline these properties in individual hooks or components.

## Frontend Code Style Rules
- **Strict Component Export Pattern**: Use inline named function exports exclusively (`export function Component(...) { ... }`) to ensure consistent naming and better refactoring support. Do not use `export default`, nor the separated pattern (`const Component = (...) => {}; export { Component }`).
- **Spanish Localization**: All content displayed on the pages must be in Spanish.
- **Validation**: Use **Valibot** for frontend data validation instead of manual regex where possible.
- **Config-Driven Styling**: Avoid passing raw CSS classes or repeating styles when calling components. Instead, use configuration props (e.g., `variant`, `size`, `type`) to select internally defined style sets. This ensures UI consistency and simplifies component usage.


## Component Patterns
- **Shared Components**: Reusable components like `CharacterCard` should be extracted to their own files within the relevant page folder or a shared `components` folder.


## Python Code Style and Formatting
This project uses **Ruff** for linting and formatting the backend code. All Python code must adhere to the rules defined in `ruff.toml`.

### Linting and Formatting Commands
To ensure your code follows the style guidelines, run these commands inside the backend container:

- **Check for linting issues**:
  ```bash
  docker compose exec backend ruff check .
  ```
- **Automatically fix linting issues**:
  ```bash
  docker compose exec backend ruff check --fix .
  ```
- **Format the code**:
  ```bash
  docker compose exec backend ruff format .
  ```

