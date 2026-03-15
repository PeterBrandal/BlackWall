from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import asyncio
from app.probes import ip_api, crt_sh, github, brreg
from app.utils import email_permutations


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

async def profile_generator(name: str):
    yield sse_event(f"INITIATING PROFILE COMPILATION: {name}")
    await asyncio.sleep(0.3)

    emails = email_permutations.generate_email_permutations(name)
    yield sse_event(f"[emails] {', '.join(emails[:6])}")
    await asyncio.sleep(0.3)

    # GitHub — try first name as username
    yield sse_event("[probe:start] github")
    username = name.lower().split()[0]
    found_github = False
    async for line in github.probe(username):
        yield sse_event(line)
        await asyncio.sleep(0.1)
        found_github = True
    yield sse_event("[probe:done] github" if found_github else "[probe:fail] github")

    await asyncio.sleep(0.2)

    # Brreg — search by full name
    yield sse_event("[probe:start] brreg")
    found_brreg = False
    async for line in brreg.probe(name):
        yield sse_event(line)
        await asyncio.sleep(0.1)
        found_brreg = True
    yield sse_event("[probe:done] brreg" if found_brreg else "[probe:fail] brreg")

    yield sse_event("PROFILE COMPLETE")


@app.get("/api/profile")
async def profile(name: str):
    return StreamingResponse(
        profile_generator(name),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )