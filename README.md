# Sentinel — DevOps Incident & Hindsight AI Platform

Hack With Bangalore 4.0 full-stack starter: React/Vite command center → FastAPI bridge → two n8n production webhooks.

## Start
1. Configure and run the backend: see `backend/README.md`.
2. Configure and run the frontend: see `frontend/README.md`.
3. Replace the webhook placeholders in `backend/.env` with your n8n Production webhook URLs.

Backend default: `http://localhost:8000` · Frontend default: `http://localhost:5173`

**Security:** Keep webhook URLs on the backend. Restrict CORS in production, use HTTPS, and require human approval for production remediation.
