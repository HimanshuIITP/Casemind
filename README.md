# CaseMind

CaseMind is a judicial case-management platform built as a two-part monorepo:

- `casemind-app`: a Next.js frontend for citizens, lawyers, and court staff
- `casemind-backend`: a FastAPI backend that powers authentication, case data, timelines, dashboards, and AI-assisted workflows

The product idea is to turn fragmented legal work into a single workspace where case documents, hearings, evidence, timelines, notifications, and AI analysis live together. The UI copy and backend routes point to three primary user journeys:

- Citizen portal: file petitions, track cases, upload documents, and receive status updates
- Lawyer portal: manage clients, review evidence, prepare drafts, run legal research, and monitor hearings
- Court portal: support judges and court staff with controlled judicial workflows

## What CaseMind Does

CaseMind acts like an operating system for legal case handling. The core goal is to reduce the time spent searching through PDFs, reconciling hearing dates, and manually summarizing case history.

Main capabilities inferred from the codebase:

- Role-based authentication for citizen, lawyer, and court users
- Per-role dashboards with case, hearing, notification, and task views
- Case timelines and event tracking
- Document, evidence, petition, and hearing management
- AI chat assistant grounded in the current case context
- AI-generated case summaries and bench briefs via Mistral
- Semantic-style legal search and cross-document fact extraction on the frontend concept layer

## Repository Structure

- `casemind-app/` - Next.js 16 frontend
- `casemind-backend/` - FastAPI + MongoDB backend
- `casemind-app/src/app/` - landing page, role selection, auth screens, and dashboards
- `casemind-app/src/components/` - UI sections and reusable dashboard/auth components
- `casemind-backend/app/api/` - route handlers, schemas, and service logic
- `casemind-backend/app/core/` - config, database, security, and storage helpers

## Tech Stack

- Frontend: Next.js, React 19, TypeScript, Tailwind CSS, Framer Motion
- Backend: FastAPI, Motor, PyMongo, Pydantic Settings, JWT auth, Passlib, HTTPX
- Database: MongoDB
- AI: Mistral API for chat and summary generation

## Key Flows

### Authentication

- Citizens sign up and log in with email/password
- Lawyers sign up and log in with email/password plus bar details
- Court users can register and log in with official email, court ID, and password
- JWT access tokens are issued by the backend and stored client-side

### Case Management

- Case data is stored in MongoDB collections and exposed through REST endpoints
- The backend includes separate routers for cases, documents, hearings, notifications, petitions, timeline, and dashboard data
- Timelines are treated as ordered case events

### AI Assistance

- The AI assistant can use case context when a case ID is provided
- AI responses are generated through Mistral and saved as conversation history
- The backend can also generate structured case summaries from timeline, hearings, documents, evidence, and orders

## Environment Variables

Frontend Next.js app:

- `MONGODB_URI` - MongoDB connection string used by the Next.js app-side database helper

Backend FastAPI app:

- `MONGODB_URL` - MongoDB connection string
- `DATABASE_NAME` - MongoDB database name, default `casemind`
- `JWT_SECRET` - secret used to sign access tokens
- `JWT_ALGORITHM` - JWT signing algorithm, default `HS256`
- `ACCESS_TOKEN_EXPIRE_MINUTES` - token lifetime in minutes
- `MISTRAL_API_KEY` - API key for Mistral chat and summary generation

Example files are included in the repo:

- `casemind-app/.env.example`
- `casemind-backend/.env.example`

Copy them to the real local env files before running the app.

## Local Setup

### 1. Frontend

```bash
cd casemind-app
npm install
cp .env.example .env.local
npm run dev
```

The app runs on `http://localhost:3000`.

### 2. Backend

Create and activate a Python virtual environment, then install the backend dependencies used by the codebase:

```bash
cd casemind-backend
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn motor pymongo pydantic-settings python-jose[cryptography] passlib[bcrypt] httpx
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API runs on `http://localhost:8000` and is mounted under `/api` for the frontend calls.

### 3. Run Both Together

Use two terminals:

1. Start the backend on port `8000`
2. Start the frontend on port `3000`

The frontend is already configured to call `http://localhost:8000/api`.

## API Overview

The backend exposes routes for:

- Authentication: citizen, lawyer, court, shared account endpoints
- Dashboards: citizen and lawyer dashboard data
- Cases, documents, petitions, hearings, notifications, and timeline
- Lawyer-specific workspaces: clients, cases, evidence, dashboard, calendar, notifications
- Court dashboard support
- AI chat and case summary generation

## Notes

- The frontend uses MongoDB on the Next.js side for its own helpers, while the backend uses MongoDB through Motor.
- The court portal is intentionally more controlled and uses a different login flow from citizen and lawyer accounts.
- The repository currently behaves like a dual-app monorepo rather than a single deployment unit.
