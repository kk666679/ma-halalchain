"""
Minimal HalalChain Agent Orchestrator
Serves as the entrypoint for the multi-agent system.
"""

import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import uvicorn

app = FastAPI(title="HalalChain Agent Orchestrator")

@app.get("/health")
async def health():
    return {"status": "healthy", "agents": ["supervisor", "payments", "logistics", "erp", "ecom-pos", "crm", "ai", "blockchain"]}

@app.post("/invoke")
async def invoke_agent(request: Request):
    body = await request.json()
    # For demo, echo the request; real implementation would route via LangGraph.
    return {"message": f"Agent {body.get('agent')} invoked with params {body.get('params')}"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
