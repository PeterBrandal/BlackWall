import httpx

SECURITY_HEADERS = [
    "strict-transport-security",
    "content-security-policy",
    "x-frame-options",
    "x-content-type-options",
    "referrer-policy",
    "permissions-policy",
]


async def probe(target: str):
    url = f"https://{target}"
    
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(url, timeout=10.0, follow_redirects=True)
    except httpx.TimeoutException:
        yield f"[headers] TIMEOUT"
        return
    except Exception as e:
        yield f"[headers] FAILED — {type(e).__name__}"
        return
    
    
    yield f"[headers] Status  : {r.status_code}"
    yield f"[headers] Server  : {r.headers.get('server', '—')}"
    yield f"[headers] Powered : {r.headers.get('x-powered-by', '—')}"
    
    
    yield f"[headers] --- Security Headers ---"
    for header in SECURITY_HEADERS:
        value = r.headers.get(header)
        if value:
            short = value[:60] + "..." if len(value) > 60 else value
            yield f"[headers] ✓ {header}: {short}"
        else:
            yield f"[headers] ✗ MISSING: {header}"