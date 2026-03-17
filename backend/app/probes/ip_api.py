import httpx

async def probe(target: str):
    url = f'http://ip-api.com/json/{target}'
    
    async with httpx.AsyncClient() as client:
        r = await client.get(url, timeout=10.0)
        data = r.json()
        
    if data.get("status") == "fail":
        yield f"[ip-api] FAILED — {data.get('message', 'unknown')}"
        return
    
    yield f"[ip-api] IP       : {data.get('query')}"
    yield f"[ip-api] Location : {data.get('city')}, {data.get('regionName')}, {data.get('country')}"
    yield f"[ip-api] ISP      : {data.get('isp')}"
    yield f"[ip-api] Org      : {data.get('org')}"
    yield f"[ip-api] Timezone : {data.get('timezone')}"
    yield f"[ip-api] Geo      : {data.get('lat')}, {data.get('lon')}"
    yield f"[geo] {data.get('lat')}, {data.get('lon')}"
    