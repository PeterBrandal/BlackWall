import whois
import asyncio


async def probe(target: str):
    try:
        w = await asyncio.to_thread(whois.whois, target)
    except Exception as e:
        yield f"[whois] FAILED — {e}"
        return

    if not w or not w.domain_name:
        yield f"[whois] No WHOIS data found for: {target}"
        return

    def fmt_date(d):
        if not d:
            return "—"
        if isinstance(d, list):
            d = d[0]
        return str(d)[:10]

    yield f"[whois] Registrar  : {w.registrar or '—'}"
    yield f"[whois] Created    : {fmt_date(w.creation_date)}"
    yield f"[whois] Expires    : {fmt_date(w.expiration_date)}"
    yield f"[whois] Updated    : {fmt_date(w.updated_date)}"

    ns = w.name_servers
    if ns:
        for nameserver in list(ns)[:3]:
            yield f"[whois] Nameserver : {str(nameserver).lower()}"

    if w.country:
        yield f"[whois] Country    : {w.country}"
