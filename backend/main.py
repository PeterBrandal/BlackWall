from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import asyncio
from app.probes import ip_api, crt_sh, github, wayback, dns_probe, whois_probe

app = FastAPI(title="BlackWall Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


def sse_event(data: str) -> str:
    return f"data: {data}\n\n"


def is_ip(target: str) -> bool:
    parts = target.split(".")
    return len(parts) == 4 and all(p.isdigit() for p in parts)


async def scan_generator(target: str):
    yield sse_event(f"INITIATING SCAN: {target}")
    await asyncio.sleep(0.2)

    target_is_ip = is_ip(target)

    # --- IP-API (always) ---
    async for line in ip_api.probe(target):
        yield sse_event(line)
        await asyncio.sleep(0.05)

    await asyncio.sleep(0.2)

    if not target_is_ip:
        # --- WHOIS ---
        async for line in whois_probe.probe(target):
            yield sse_event(line)
            await asyncio.sleep(0.05)

        await asyncio.sleep(0.2)

        # --- DNS ---
        async for line in dns_probe.probe(target):
            yield sse_event(line)
            await asyncio.sleep(0.05)

        await asyncio.sleep(0.2)

        # --- CRT.SH ---
        async for line in crt_sh.probe(target):
            yield sse_event(line)
            await asyncio.sleep(0.05)

        await asyncio.sleep(0.2)

        # --- Wayback ---
        async for line in wayback.probe(target):
            yield sse_event(line)
            await asyncio.sleep(0.05)

        await asyncio.sleep(0.2)

        # --- GitHub ---
        async for line in github.probe(target):
            yield sse_event(line)
            await asyncio.sleep(0.05)

    yield sse_event("SCAN COMPLETE")


@app.get("/api/scan")
async def scan(target: str):
    return StreamingResponse(
        scan_generator(target),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
