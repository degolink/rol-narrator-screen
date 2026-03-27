# Rol Narrator Screen

This project is a companion application designed for Dungeons & Dragons Game Masters (Narrators). It allows you to quickly create characters, manage their base stats, and dynamically update resources like hit points and currency through an intuitive React dashboard.

The application is built using a modern **Django + Django REST Framework** backend, using **PostgreSQL** for the database running inside a Docker Container. The front end is powered by **React**, bootstrapped with Vite.

## Requirements

Before running the project, ensure you have the following installed:
- [Docker](https://www.docker.com/) and Docker Compose

**Note:** Recommended [Docker Desktop](https://docs.docker.com/get-started/get-docker/)

---

### 🚀 Setup & Running with Docker

The project uses **Caddy** as a gateway and provides **automatic HTTPS** for the local domain.

#### 1. Configure Environment Variables

Copy the sample environment file and fill in the values:

```bash
cp env.sample .env
```

#### 2. Start the Project (Automated)

To simplify access and configuration, use the provided start script. This script will detect your local IP and automatically activate the alias `pantallanarrador.local` while it's running.

**For normal use:**
```bash
./start.sh
```

**For development (rebuild containers):**
```bash
./start.sh --dev
```

> [!TIP]
> While the script is running, you can access it from any device on your Wi-Fi at `https://pantallanarrador.local`. When you stop the script (Ctrl+C), the network and Docker services will stop.

---
You can use a custom domain by setting the `FRONTEND_DOMAIN` environment variable:

1.  Open your `.env` file.
2.  Set `FRONTEND_DOMAIN` to your desired domain (e.g., `my-dnd-screen.com`).
3.  **Caddy** will automatically use this URL to provision SSL certificates and route traffic.
4.  If you are using a local domain (like the default `pantallanarrador.local`), ensure it resolves correctly to your machine's IP.

> [!IMPORTANT]
> The `FRONTEND_DOMAIN` is used by both the backend (to handle CORS and redirects) and Caddy (to configure the gateway).

---
### 🔐 Authentication (Magic Links)

This project uses a passwordless login system:

1.  Enter your email on the home page.
2.  If it's your first time, you'll be asked for a username.
3.  The system will generate an access link (Magic Link).
4.  **In development:** The link will appear in the terminal where the backend (`rol_backend`) is running.
5.  Click the link to log in automatically.

---
### Ports and Services:
- **Gateway (Caddy)**: `https://pantallanarrador.local` (Port 443 by default, or your custom `FRONTEND_URL`).
- **Local Email Service (Mailpit)**: [http://localhost:8025/](http://localhost:8025/) (Access Magic Links here during development).
- HTTP traffic (80) is automatically redirected to HTTPS.

---

## Usage
1.  Open your browser at `https://pantallanarrador.local` (or your custom domain).
2.  Log in with your Magic Link and manage your D&D sessions in real-time.
