from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import asyncio
from app.probes import ip_api

app = FastAPI(title="BlackWall Backend API")

# --- CORS (Cross-Origin Resource Sharing) ---
# Without CORS, the browser will block requests from the frontend to the backend if they are on different origins (e.g., different ports).

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


# --- SSE-Helper (Server-Sent Events) ---
# This is a helper function to create a streaming response for SSE.
def sse_event(data: str) -> str:
    return f"data: {data}\n\n"


# --- Fake Scan Stream ---
# An async generator that simulates a long-running scan and yields results as they become available.
async def scan_generator(target: str):
    yield sse_event(f"INITIATING BREACH ON TARGET: {target}")
    await asyncio.sleep(0.5)
    
    
    yield sse_event("PROBE [ip-api]")
    async for line in ip_api.probe(target):
        yield sse_event(line)
        await asyncio.sleep(0.15)
  
    yield sse_event("SCAN COMPLETE")


@app.get("/health")
async def health_check():
    return {"status": "online", "system": "BLACKWALL"}


@app.get("/api/scan")
async def scan(target: str):
    return StreamingResponse(
        scan_generator(target),
        media_type="text/event-stream",
        headers={
            # Avoid buffering and caching of the response, send data immediately
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # Disable buffering for Nginx if added
        }
    )
