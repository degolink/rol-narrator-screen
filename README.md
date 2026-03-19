# Rol Narrator Screen

This project is a companion application designed for Dungeons & Dragons Game Masters (Narrators). It allows you to quickly create characters, manage their base stats, and dynamically update resources like hit points and currency (copper, silver, gold, and platinum) through an intuitive React dashboard.

The application is built using a modern **Django + Django REST Framework** backend, using **PostgreSQL** for the database running inside a Docker Container. The front end is powered by **React**, bootstrapped with Vite.

## Requirements

Before running the project locally, ensure you have the following installed:
- [Docker](https://www.docker.com/) and Docker Compose
- [Python 3.9+](https://www.python.org/)
- [uv](https://github.com/astral-sh/uv) (for managing Python dependencies quickly)
- [Node.js](https://nodejs.org/) & `npm`

---

## 🚀 Setup & Running Locally (Docker Development Environment)

The recommended way to develop this application is using the provided Docker Compose configuration. This setup spins up the entire application stack—Database, Backend, and Frontend—and is configured specifically for local development with **Hot Live-Reload** enabled.

```bash
# From the project root simply run:
docker compose up --build
```

### What this does:
1. **PostgreSQL Database (`db`)**: Starts a container on port `5432` with an initialized database named `rol_narrator_screen`.
2. **Django Backend (`backend`)**: Builds the Python environment using `uv`, and starts the Django server on `http://localhost:8000`. Your local repository root is mounted as a volume (`.:/app`), meaning that any Python code changes you make will instantly reload the Django server.
3. **React Frontend (`frontend`)**: Builds the Node environment and starts Vite on `http://localhost:5173`. The `./frontend` directory is mounted into the container (`./frontend:/app`), ensuring that any component or CSS tweaks instantly trigger Vite's Hot Module Replacement (HMR) right in your browser.

*Note: You do not need to install Python or Node locally on your host machine to run this project via Docker.*

---
### Running manually without full Docker Compose (Alternative)

If you only want to use Docker for the database and run the servers manually locally:

#### 1. Database (Docker)
```bash
docker compose up -d db
```

### 2. Backend (Django)

Initialize the Python environment and run the Django API server.

```bash
# Set up virtual environment and install dependencies
uv venv
source .venv/bin/activate
uv pip install -r requirements.txt  # Or manually install django djangorestframework psycopg2-binary django-cors-headers if no requirements file

# Run database migrations
python manage.py migrate

# Start the development server (runs on http://localhost:8000)
python manage.py runserver
```

### 3. Frontend (React)

Open a new terminal session, navigate to the `frontend` directory, and start the React Vite server.

```bash
cd frontend

# Install dependencies (only required the first time)
npm install

# Start the development server (runs on http://localhost:5173 by default)
npm run dev
```

---

## Usage

Once both servers are running:
1. Open your browser and go to `http://localhost:5173`.
2. Use the **Crear Personaje** form on the right sidebar to add new characters to your campaign.
3. Manage their coins in real-time by clicking the `-` and `+` buttons on their character cards.
4. You can also delete characters that are no longer part of the campaign by clicking the red `X` button on their cards.

## Architecture & Technology Stack
- **Backend**: Django 4.2+, Django REST Framework (DRF), `django-cors-headers`, `psycopg2-binary`.
- **Frontend**: React 18, Vite, Axios, Lucide React (optional icons).
- **Database**: PostgreSQL 15 (Containerized).
