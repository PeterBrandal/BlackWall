from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import asyncio
from dotenv import load_dotenv
from app.probes import ip_api, crt_sh, github, dns_probe, whois_probe, headers_probe, ssl_probe, redirect_probe, gdpr_probe

load_dotenv()

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

    # --- IP-API ---
    yield sse_event("[probe:start] ip-api")
    has_data = False
    async for line in ip_api.probe(target):
        yield sse_event(line)
        await asyncio.sleep(0.05)
        has_data = True
    yield sse_event("[probe:done] ip-api" if has_data else "[probe:fail] ip-api")
    await asyncio.sleep(0.2)

    if not target_is_ip:
        # --- WHOIS ---
        yield sse_event("[probe:start] whois")
        has_data = False
        async for line in whois_probe.probe(target):
            yield sse_event(line)
            await asyncio.sleep(0.05)
            has_data = True
        yield sse_event("[probe:done] whois" if has_data else "[probe:fail] whois")
        await asyncio.sleep(0.2)

        # --- DNS ---
        yield sse_event("[probe:start] dns")
        has_data = False
        async for line in dns_probe.probe(target):
            yield sse_event(line)
            await asyncio.sleep(0.05)
            has_data = True
        yield sse_event("[probe:done] dns" if has_data else "[probe:fail] dns")
        await asyncio.sleep(0.2)

        # --- CRT.SH ---
        yield sse_event("[probe:start] crt.sh")
        has_data = False
        async for line in crt_sh.probe(target):
            yield sse_event(line)
            await asyncio.sleep(0.05)
            has_data = True
        yield sse_event("[probe:done] crt.sh" if has_data else "[probe:fail] crt.sh")
        await asyncio.sleep(0.2)

        # --- SSL ---
        yield sse_event("[probe:start] ssl")
        has_data = False
        async for line in ssl_probe.probe(target):
            yield sse_event(line)
            await asyncio.sleep(0.05)
            has_data = True
        yield sse_event("[probe:done] ssl" if has_data else "[probe:fail] ssl")
        await asyncio.sleep(0.2)

        # --- Redirect ---
        yield sse_event("[probe:start] redirect")
        has_data = False
        async for line in redirect_probe.probe(target):
            yield sse_event(line)
            await asyncio.sleep(0.05)
            has_data = True
        yield sse_event("[probe:done] redirect" if has_data else "[probe:fail] redirect")
        await asyncio.sleep(0.2)

        # --- GitHub ---
        yield sse_event("[probe:start] github")
        has_data = False
        async for line in github.probe(target):
            yield sse_event(line)
            await asyncio.sleep(0.05)
            has_data = True
        yield sse_event("[probe:done] github" if has_data else "[probe:fail] github")
        await asyncio.sleep(0.2)

        # --- HTTP Headers ---
        yield sse_event("[probe:start] headers")
        has_data = False
        async for line in headers_probe.probe(target):
            yield sse_event(line)
            await asyncio.sleep(0.05)
            has_data = True
        yield sse_event("[probe:done] headers" if has_data else "[probe:fail] headers")
        await asyncio.sleep(0.2)

        # --- GDPR ---
        yield sse_event("[probe:start] gdpr")
        has_data = False
        async for line in gdpr_probe.probe(target):
            yield sse_event(line)
            await asyncio.sleep(0.05)
            has_data = True
        yield sse_event("[probe:done] gdpr" if has_data else "[probe:fail] gdpr")

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
