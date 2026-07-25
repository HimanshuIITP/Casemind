# Deployment Guide

This document describes recommended deployment steps for the CaseMind project.

## Frontend — Deploy `casemind-app` to Vercel

1. Sign in to Vercel and click **Import Project** → **Import Git Repository**.
2. Select `HimanshuIITP/Casemind` as the repository and set the **Root Directory** to `casemind-app`.
3. Build settings (Vercel usually auto-detects Next.js):

   - Framework Preset: `Next.js`
   - Build Command: `npm run build`
   - Output Directory: leave blank (auto-detected)

4. Environment variables (set these in the Vercel dashboard for the Frontend project):

   - `NEXT_PUBLIC_API_URL` — e.g. `https://api.your-domain.com/api` or the deployed backend URL

5. Deploy. Vercel will build and serve the Next.js app.

Notes:
- If you use rewrites/proxying to the API during development, update `NEXT_PUBLIC_API_URL` to point to your backend host.

## Backend — Containerized (recommended)

We provide a `Dockerfile` at `casemind-backend/Dockerfile` for container-based hosting (Render, Railway, Fly.io, DigitalOcean App Platform, etc.).

Build and run locally:

```bash
# Build image
docker build -t casemind-backend -f casemind-backend/Dockerfile /home/himanshu/Desktop/Casemind

# Run container (example)
docker run -p 8000:8000 \
  -e MONGODB_URL="<your-mongo-connection>" \
  -e DATABASE_NAME="casemind" \
  -e JWT_SECRET="changeme" \
  -e MISTRAL_API_KEY="<key-if-needed>" \
  casemind-backend
```

Deploying to Render (Docker service):

1. Create a new **Web Service** (or **Private Service**) on Render.
2. Connect your GitHub repo and select the root branch.
3. Choose "Docker" as the environment and point to the `casemind-backend/Dockerfile`.
4. Add environment variables (see the `Environment variables` section below).
5. Deploy.

Deploying to Railway / Fly / DigitalOcean:
- Railway: use Dockerfile deployment or the standard Python service with the same start command.
- Fly: create `fly.toml` and use `fly launch` (not covered here). Use `dockerfile` if preferred.

## Backend — Server (non-container)

If you prefer a simple process-based host (e.g., a VPS), use the start command and a process manager:

```bash
# Example start command (many hosts set $PORT)
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
```

Use `systemd`, `supervisord`, or `pm2` to keep the process alive.

## Environment variables (required / recommended)

- `MONGODB_URL` or `MONGODB_URI` — MongoDB connection string
- `DATABASE_NAME` — database name used in the backend (default found in `app/core/config.py`)
- `JWT_SECRET` — secret key for signing access tokens (set securely)
- `JWT_ALGORITHM` — e.g., `HS256`
- `ACCESS_TOKEN_EXPIRE_MINUTES` — token lifetime
- `MISTRAL_API_KEY` — optional if you use AI features
- Frontend: `NEXT_PUBLIC_API_URL` — points to the backend `/api` base URL

## Health check

The `Dockerfile` sets a basic HTTP healthcheck against `/` (adjust to `/health` if you add a dedicated health endpoint).

## Troubleshooting

- If build fails due to missing `requirements.txt`, create one in `casemind-backend/` by running in your virtualenv:

```bash
pip freeze > casemind-backend/requirements.txt
```

- If your Python dependencies are managed by `poetry` or `pipenv`, adapt the `Dockerfile` accordingly.

---

If you want, I can:

- Create a `.dockerignore` for `casemind-backend`.
- Create a simple `systemd` unit example.
- Attempt a test Docker build here and report errors.
