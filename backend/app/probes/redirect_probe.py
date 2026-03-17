import httpx
from urllib.parse import urlparse

CDN_SIGNATURES = {
    "cloudflare": "Cloudflare",
    "cloudfront": "AWS CloudFront",
    "amazonaws":  "AWS",
    "akamai":     "Akamai",
    "fastly":     "Fastly",
    "azureedge":  "Azure CDN",
}


def detect_cdn(url: str, headers: dict) -> str | None:
    url_lower = url.lower()
    for key, name in CDN_SIGNATURES.items():
        if key in url_lower:
            return name

    server = headers.get("server", "").lower()
    via    = headers.get("via", "").lower()
    for key, name in CDN_SIGNATURES.items():
        if key in server or key in via:
            return name

    return None


async def probe(target: str):
    url = f"http://{target}"

    try:
        async with httpx.AsyncClient(follow_redirects=False, timeout=10.0) as client:
            chain = []
            final_headers = {}

            for _ in range(10):
                try:
                    r = await client.get(url)
                except Exception:
                    break

                chain.append((r.status_code, url))
                final_headers = dict(r.headers)

                if r.status_code not in (301, 302, 303, 307, 308):
                    break

                location = r.headers.get("location", "")
                if not location:
                    break

                if location.startswith("/"):
                    parsed = urlparse(url)
                    location = f"{parsed.scheme}://{parsed.netloc}{location}"

                url = location

    except httpx.TimeoutException:
        yield "[redirect] TIMEOUT"
        return
    except Exception as e:
        yield f"[redirect] FAILED — {type(e).__name__}"
        return

    if not chain:
        yield "[redirect] No response"
        return

    yield f"[redirect] Hops         : {len(chain)}"

    for i, (status, hop_url) in enumerate(chain):
        label = "FINAL" if i == len(chain) - 1 else f"HOP {i + 1}"
        yield f"[redirect] {label}        : [{status}] {hop_url}"

    cdn = detect_cdn(chain[-1][1], final_headers)
    if cdn:
        yield f"[redirect] CDN          : {cdn}"
