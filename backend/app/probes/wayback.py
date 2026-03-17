import httpx
import asyncio

async def probe(target: str):
    url = "http://archive.org/wayback/available"
    params = {"url": target}

    for attempt in range(3):
        try:
            async with httpx.AsyncClient() as client:
                r = await client.get(url, params=params, timeout=15.0)

            if r.status_code == 429:
                await asyncio.sleep(2 ** attempt)  # 1s, 2s, 4s
                continue

            if r.status_code != 200:
                yield f"[wayback] FAILED — HTTP {r.status_code}"
                return

            data = r.json()
            snapshot = data.get("archived_snapshots", {}).get("closest", {})

            if not snapshot or not snapshot.get("available"):
                yield f"[wayback] No snapshots found for: {target}"
                return

            timestamp = snapshot.get("timestamp", "—")
            snap_url  = snapshot.get("url", "—")

            if len(timestamp) >= 8:
                formatted = f"{timestamp[:4]}-{timestamp[4:6]}-{timestamp[6:8]}"
            else:
                formatted = timestamp

            yield f"[wayback] Snapshot found"
            yield f"[wayback] Last archived : {formatted}"
            yield f"[wayback] Snapshot URL  : {snap_url}"
            return

        except httpx.TimeoutException:
            yield f"[wayback] TIMEOUT on attempt {attempt + 1}"
            await asyncio.sleep(1)

    yield "[wayback] FAILED — rate limited after 3 attempts"
';'