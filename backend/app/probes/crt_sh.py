import httpx

MAX_RESULTS = 20


async def probe(target: str):
    url = f"https://crt.sh/?q={target}&output=json"

    async with httpx.AsyncClient() as client:
        try:
         r = await client.get(url, timeout=30)
        except httpx.TimeoutException:
            yield f"[crt.sh] TIMEOUT — crt.sh took too long"
        return

    if r.status_code != 200:
        yield f"[crt.sh] FAILED - HTTP {r.status_code}"

    data = r.json()

    if not data:
        yield f"[crt.sh] No certificates found for {target}"

    # Deduplicate and clean up wildcard entries
    seen = set()

    for entry in data:
        for name in entry["name_value"].split("\n"):
            name = name.strip().lstrip("*.")
            if name and name not in seen:
                seen.add(name)
                yield f"[crt.sh] {name}"
