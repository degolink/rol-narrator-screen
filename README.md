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

To simplify access and configuration, use the provided start script. This script will detect your local IP and automatically activate the alias `rol.local` while it's running.

**For normal use:**

```bash
./start.sh
```

**For development (rebuild containers):**

```bash
./start.sh --dev
```

> [!TIP]
> While the script is running, you can access it from any device on your Wi-Fi at `https://rol.local`. When you stop the script (Ctrl+C), the network and Docker services will stop.

---

You can use a custom domain by setting the `FRONTEND_DOMAIN` environment variable:

1.  Open your `.env` file.
2.  Set `FRONTEND_DOMAIN` to your desired domain (e.g., `my-dnd-screen.com`).
3.  **Caddy** will automatically use this URL to provision SSL certificates and route traffic.
4.  If you are using a local domain (like the default `rol.local`), ensure it resolves correctly to your machine's IP.

> [!IMPORTANT]
> The `FRONTEND_DOMAIN` is used by both the backend (to handle CORS and redirects) and Caddy (to configure the gateway).

---

### 🔐 Authentication (Magic Links)

This project uses a passwordless login system:

1.  Enter your email on the home page.
2.  If it's your first time, you'll be asked for a username.
3.  The system will generate an access link (Magic Link).
4.  Click the link to log in automatically.

#### Email delivery modes

| Mode | When | How |
|---|---|---|
| **Mailpit (local)** | `EMAIL_HOST_PASSWORD` not set in `.env` | Magic links captured at [https://rol.local/email](https://rol.local/email) — no real emails sent |
| **Real email (Brevo)** | `EMAIL_HOST_PASSWORD` set in `.env` | Magic links sent to the user's actual inbox |

**To enable real email delivery via [Brevo](https://brevo.com):**

1. Create a free account at [brevo.com](https://brevo.com).
2. Verify your sender email at **Settings → Senders & IPs**.
3. Get your SMTP key at **Settings → SMTP & API → SMTP tab**.
4. Uncomment and fill in the Brevo block in your `.env`:
   ```dotenv
   EMAIL_HOST=smtp-relay.brevo.com
   EMAIL_PORT=587
   EMAIL_HOST_USER=your-brevo-login-email
   EMAIL_HOST_PASSWORD=your-brevo-smtp-key
   DEFAULT_FROM_EMAIL=your-verified-sender-email
   ```
5. Restart the backend — emails will now be delivered to real inboxes.

> [!TIP]
> Leave `EMAIL_HOST_PASSWORD` commented out to fall back to Mailpit automatically. No code change needed.

---

### Ports and Services:

- **Gateway (Caddy)**: `https://rol.local` (Port 443 by default, or your custom `FRONTEND_URL`).
- **Local Email Service (Mailpit)**: [https://rol.local/email](https://rol.local/email) (Access Magic Links here during development, when Brevo is not configured).
- HTTP traffic (80) is automatically redirected to HTTPS.
- **D&D 5e API**: [https://rol.local/dnd5e-api/api](https://rol.local/dnd5e-api/api)

---

### 🎲 D&D 5e SRD Integration

The project includes a local instance of the [dnd5e-api](https://github.com/5e-bits/5e-srd-api) to provide SRD data for spells, monsters, and classes.

#### Initial Setup (Required Once)

Before using the SRD data, you must initialize the MongoDB database. We provide a one-time setup script:

```bash
./setup.sh
```

This script will start the necessary containers. The database is pre-seeded with the official SRD data, so no manual loading is required.

---

## Usage

1.  Open your browser at `https://rol.local` (or your custom domain).
2.  Log in with your Magic Link and manage your D&D sessions in real-time.

---

### 🧪 Testing

The project includes a comprehensive suite of integration tests for the backend API and WebSockets.

**To run all tests:**

```bash
docker compose exec backend pytest
```

**Note:** The tests are also automatically executed before every `git push` via a Husky hook to ensure stability.
