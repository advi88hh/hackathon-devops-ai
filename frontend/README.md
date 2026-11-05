# Frontend — Sentinel Command Center

## Run locally
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Open http://localhost:5173.

Set `VITE_API_BASE_URL` to the FastAPI base URL (no trailing slash). The default is `http://localhost:8000`.

## Build
```bash
npm run build
npm run preview
```

The browser calls the FastAPI bridge only. n8n webhook URLs remain on the backend and are never exposed to the browser.
