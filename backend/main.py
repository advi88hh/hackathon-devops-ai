import os
from pathlib import Path
from typing import Any
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Load local settings first, then fall back to .env; hosted environments can provide variables directly.
load_dotenv(Path(__file__).with_name(".env.local"))
load_dotenv(Path(__file__).with_name(".env"))

# Configure these in backend/.env or your hosting provider's environment.
# Do not put webhook URLs or credentials in the frontend.
INCIDENT_WEBHOOK_URL = os.getenv("N8N_INCIDENT_WEBHOOK_URL", "")
REMEDIATION_WEBHOOK_URL = os.getenv("N8N_REMEDIATION_WEBHOOK_URL", "")
N8N_TIMEOUT_SECONDS = float(os.getenv("N8N_TIMEOUT_SECONDS", "90"))

app = FastAPI(
    title="DevOps Incident & Hindsight AI Bridge",
    version="1.0.0",
    description="Secure API bridge between the command center UI and n8n workflows.",
)

allowed_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins if origin.strip()],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

class IncidentPayload(BaseModel):
    service: str = Field(min_length=1, max_length=120)
    error_signature: str = Field(min_length=1, max_length=4000)
    severity: str = Field(pattern=r"^(Critical P0|High P1|Medium P2|Low P3)$")
    source: str = "Hack With Bangalore 4.0 Command Center"
    requested_action: str = "triage_and_hindsight_analysis"

class RemediationPayload(IncidentPayload):
    requested_action: str = "auto_remediation_and_runbooks"
    approval_mode: str = "human_in_the_loop"

async def forward_to_n8n(webhook_url: str, payload: dict[str, Any], workflow_name: str):
    if not webhook_url or not webhook_url.startswith(("https://", "http://")):
        raise HTTPException(
            status_code=503,
            detail=f"{workflow_name} webhook is not configured. Set the corresponding N8N_*_WEBHOOK_URL environment variable.",
        )

    try:
        async with httpx.AsyncClient(timeout=N8N_TIMEOUT_SECONDS) as client:
            response = await client.post(webhook_url, json=payload)
            response.raise_for_status()
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail=f"{workflow_name} workflow timed out.")
    except httpx.HTTPStatusError as exc:
        detail = exc.response.text[:1500] or "n8n returned an error."
        raise HTTPException(status_code=502, detail=f"{workflow_name} workflow failed: {detail}")
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Could not reach {workflow_name} workflow: {str(exc)}")

    # n8n workflows may return JSON or plain text. Preserve either response.
    try:
        result = response.json()
    except ValueError:
        result = {"output": response.text}

    return {
        "ok": True,
        "workflow": workflow_name,
        "status_code": response.status_code,
        "result": result,
    }

@app.get("/api/health")
async def health():
    return {
        "status": "online",
        "service": "devops-ai-bridge",
        "incident_webhook_configured": bool(INCIDENT_WEBHOOK_URL),
        "remediation_webhook_configured": bool(REMEDIATION_WEBHOOK_URL),
    }

@app.post("/api/trigger-incident-1")
async def trigger_incident(payload: IncidentPayload):
    data = payload.model_dump()
    return await forward_to_n8n(INCIDENT_WEBHOOK_URL, data, "Triage & Hindsight Analysis")

@app.post("/api/trigger-remediation-2")
async def trigger_remediation(payload: RemediationPayload):
    data = payload.model_dump()
    return await forward_to_n8n(REMEDIATION_WEBHOOK_URL, data, "Auto-Remediation & Runbooks")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)
