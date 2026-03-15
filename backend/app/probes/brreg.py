import httpx

MAX_RESULTS = 5

async def probe(target: str):
    url = "https://data.brreg.no/enhetsregisteret/api/enheter"
    params = {"navn": target, "size": MAX_RESULTS}
    
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(url, params=params, timeout=10)
    except httpx.TimeoutException:
        yield "[brreg] TIMEOUT - Request timed out"
        return
    
    if r.status_code != 200:
        yield f"[brreg] FAILED - HTTP {r.status_code}"
        return
    
    data = r.json()
    hits = data.get("_embedded", {}).get("enheter", [])
    
    if not hits:
        yield f"[brreg] No company affiliations found for: {target}"
        return
    
    for company in hits:
        name    = company.get("navn", "—")
        org_nr  = company.get("organisasjonsnummer", "—")
        form    = company.get("organisasjonsform", {}).get("beskrivelse", "—")
        address = company.get("forretningsadresse", {})
        city    = address.get("poststed", "—")
        bankrupt = company.get("konkurs", False)

        status = "KONKURS" if bankrupt else "ACTIVE"
        yield f"[brreg] {name}"
        yield f"[brreg]   Org nr  : {org_nr}"
        yield f"[brreg]   Type    : {form}"
        yield f"[brreg]   City    : {city}"
        yield f"[brreg]   Status  : {status}"
    