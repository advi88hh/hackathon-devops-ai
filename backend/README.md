# Backend — FastAPI → n8n

## Setup
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and replace both placeholder URLs with your **n8n Production** webhook URLs. For machine-local settings, use `.env.local`; it takes precedence over `.env` and should not be committed. The bridge loads both files automatically when `python-dotenv` is installed. Environment variables already set by the hosting environment take precedence over either file.

Run:
```bash
python main.py
```
API docs: http://localhost:8000/docs

## Endpoints
- `GET /api/health`
- `POST /api/trigger-incident-1` — Triage & Hindsight Analysis
- `POST /api/trigger-remediation-2` — Auto-Remediation & Runbooks

Both POST routes accept `service`, `error_signature`, and `severity`. The remediation route also sends `approval_mode: human_in_the_loop`.

## n8n response shape
The bridge returns `{ ok, workflow, status_code, result }`. `result` preserves JSON responses and wraps plain-text responses as `{ "output": "..." }`.

## Production notes
- Keep webhook URLs server-side; never add them to Vite variables.
- Set `CORS_ORIGINS` to your deployed frontend origin(s), not `*`.
- Put the API behind HTTPS and add authentication/rate limiting before exposing it publicly.
- Configure n8n to require authentication or use unguessable production webhook paths.
- Treat remediation as a proposal/approval workflow. Validate commands and require human approval before executing changes in production.
