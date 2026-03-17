import httpx
import re

# ── CMP signatures ────────────────────────────────────────────────────────────
CMP_SIGNATURES: dict[str, str] = {
    "cdn.cookiebot.com":             "Cookiebot",
    "cdn.onetrust.com":              "OneTrust",
    "cdn-cookiepro.com":             "OneTrust CookiePro",
    "quantcast.mgr.consensu.org":    "Quantcast",
    "consent.truste.com":            "TrustArc",
    "app.usercentrics.eu":           "Usercentrics",
    "privacy-mgmt.com":              "Sourcepoint",
    "cc.cdn.civiccomputing.com":     "Civic Cookie Control",
    "cookiehub.net":                 "CookieHub",
    "axeptio.eu":                    "Axeptio",
    "consentmanager.net":            "Consentmanager",
}

# ── Tracker database ──────────────────────────────────────────────────────────
# category: "essential" | "analytics" | "advertising"
# schrems2: routes data to US processor
TRACKERS: dict[str, dict] = {
    "google-analytics.com":      {"name": "Google Analytics",      "category": "analytics",    "schrems2": True},
    "googletagmanager.com":      {"name": "Google Tag Manager",    "category": "analytics",    "schrems2": True},
    "googlesyndication.com":     {"name": "Google Ads",            "category": "advertising",  "schrems2": True},
    "doubleclick.net":           {"name": "Google DoubleClick",    "category": "advertising",  "schrems2": True},
    "connect.facebook.net":      {"name": "Meta Pixel",            "category": "advertising",  "schrems2": True},
    "facebook.net":              {"name": "Meta Pixel",            "category": "advertising",  "schrems2": True},
    "tiktok.com":                {"name": "TikTok Pixel",          "category": "advertising",  "schrems2": True},
    "ads.tiktok.com":            {"name": "TikTok Ads",            "category": "advertising",  "schrems2": True},
    "criteo.com":                {"name": "Criteo",                "category": "advertising",  "schrems2": True},
    "thetradedesk.com":          {"name": "The Trade Desk",        "category": "advertising",  "schrems2": True},
    "adsrvr.org":                {"name": "The Trade Desk",        "category": "advertising",  "schrems2": True},
    "hotjar.com":                {"name": "Hotjar",                "category": "analytics",    "schrems2": True},
    "segment.com":               {"name": "Segment",               "category": "analytics",    "schrems2": True},
    "segment.io":                {"name": "Segment",               "category": "analytics",    "schrems2": True},
    "amplitude.com":             {"name": "Amplitude",             "category": "analytics",    "schrems2": True},
    "mixpanel.com":              {"name": "Mixpanel",              "category": "analytics",    "schrems2": True},
    "snap.com":                  {"name": "Snapchat Pixel",        "category": "advertising",  "schrems2": True},
    "snapchat.com":              {"name": "Snapchat Pixel",        "category": "advertising",  "schrems2": True},
    "linkedin.com":              {"name": "LinkedIn Insight Tag",  "category": "advertising",  "schrems2": True},
    "ads.linkedin.com":          {"name": "LinkedIn Ads",          "category": "advertising",  "schrems2": True},
    "twitter.com":               {"name": "X/Twitter Pixel",       "category": "advertising",  "schrems2": True},
    "static.ads-twitter.com":    {"name": "X/Twitter Ads",         "category": "advertising",  "schrems2": True},
    "clarity.ms":                {"name": "Microsoft Clarity",     "category": "analytics",    "schrems2": True},
    "bat.bing.com":              {"name": "Microsoft Ads",         "category": "advertising",  "schrems2": True},
    "sc-static.net":             {"name": "Snapchat",              "category": "advertising",  "schrems2": True},
    "cdn.heapanalytics.com":     {"name": "Heap Analytics",        "category": "analytics",    "schrems2": True},
    "fullstory.com":             {"name": "FullStory",             "category": "analytics",    "schrems2": True},
    "intercom.io":               {"name": "Intercom",              "category": "analytics",    "schrems2": True},
    "matomo.cloud":              {"name": "Matomo Cloud",          "category": "analytics",    "schrems2": False},
}

# ── DPA by TLD ────────────────────────────────────────────────────────────────
DPA_BY_TLD: dict[str, str] = {
    "no": "Datatilsynet (Norway)",
    "de": "BfDI (Germany)",
    "fr": "CNIL (France)",
    "it": "Garante (Italy)",
    "es": "AEPD (Spain)",
    "nl": "AP (Netherlands)",
    "se": "IMY (Sweden)",
    "dk": "Datatilsynet (Denmark)",
    "fi": "Tietosuojavaltuutettu (Finland)",
    "ie": "DPC (Ireland)",
    "pl": "UODO (Poland)",
    "be": "APD (Belgium)",
    "at": "DSB (Austria)",
    "pt": "CNPD (Portugal)",
    "com": "ICO (UK) or EDPB",
    "eu": "EDPB",
}

SCRIPT_RE = re.compile(r'<script[^>]+src=["\']([^"\']+)["\']', re.IGNORECASE)


def _get_tld(domain: str) -> str:
    parts = domain.rstrip("/").split(".")
    return parts[-1].lower() if parts else "com"


def _scan_scripts(html: str) -> tuple[list[str], list[dict]]:
    """Return (detected_cmps, detected_trackers) from script src tags."""
    src_urls = SCRIPT_RE.findall(html)

    cmps: list[str] = []
    trackers: list[dict] = []
    seen_trackers: set[str] = set()

    for src in src_urls:
        src_lower = src.lower()

        for sig, name in CMP_SIGNATURES.items():
            if sig in src_lower and name not in cmps:
                cmps.append(name)

        for domain, info in TRACKERS.items():
            if domain in src_lower and info["name"] not in seen_trackers:
                trackers.append({**info, "domain": domain})
                seen_trackers.add(info["name"])

    return cmps, trackers


def _build_verdict(
    cmp: list[str],
    trackers: list[dict],
    domain: str,
) -> dict:
    advertising = [t for t in trackers if t["category"] == "advertising"]
    schrems2    = [t for t in trackers if t["schrems2"]]
    tld         = _get_tld(domain)
    dpa         = DPA_BY_TLD.get(tld, "Relevant EU DPA")

    violation        = False
    violation_reason = ""

    if advertising and not cmp:
        violation        = True
        violation_reason = (
            f"Advertising trackers detected ({', '.join(t['name'] for t in advertising)}) "
            f"with no consent management platform. Explicit user consent is required before "
            f"loading advertising or profiling scripts under GDPR Art. 6(1)(a)."
        )
    elif schrems2 and not cmp:
        violation        = True
        violation_reason = (
            f"US-based data processors detected ({', '.join(t['name'] for t in schrems2)}) "
            f"with no consent mechanism. Data transfers to US processors require either "
            f"Standard Contractual Clauses or explicit user consent post-Schrems II."
        )
    elif advertising and cmp:
        violation_reason = (
            f"CMP detected ({cmp[0]}), but advertising trackers are present. "
            f"Verify that consent is collected before these trackers fire."
        )

    # Plain-language summary
    if violation:
        summary = (
            f"This site appears to load tracking scripts without asking for user consent first. "
            f"Under GDPR, websites must obtain explicit consent before running advertising or "
            f"profiling tools. The relevant supervisory authority is {dpa}."
        )
    elif cmp and not advertising:
        summary = (
            f"A consent management platform ({cmp[0]}) is in place and no advertising trackers "
            f"were detected in the page source. No obvious GDPR violations found."
        )
    elif cmp and advertising:
        summary = (
            f"A consent management platform ({cmp[0]}) is detected alongside advertising trackers. "
            f"Compliance depends on whether consent is properly collected before trackers fire — "
            f"this requires runtime verification."
        )
    else:
        summary = (
            "No consent management platform or advertising trackers detected in page source. "
            "Note: JavaScript-loaded trackers may not be visible in static analysis."
        )

    return {
        "cmp_detected":         cmp,
        "trackers":             trackers,
        "schrems2_risk":        [t["name"] for t in schrems2],
        "likely_violation":     violation,
        "violation_reason":     violation_reason,
        "applicable_authority": dpa,
        "summary":              summary,
    }


async def probe(target: str):
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=15.0) as client:
            r = await client.get(f"https://{target}")
    except httpx.TimeoutException:
        yield "[gdpr] TIMEOUT — could not fetch page"
        return
    except Exception as e:
        yield f"[gdpr] FAILED — {type(e).__name__}"
        return

    if r.status_code != 200:
        yield f"[gdpr] FAILED — HTTP {r.status_code}"
        return

    cmps, trackers = _scan_scripts(r.text)
    verdict = _build_verdict(cmps, trackers, target)

    # CMP
    if verdict["cmp_detected"]:
        for cmp in verdict["cmp_detected"]:
            yield f"[gdpr] CMP          : {cmp}"
    else:
        yield "[gdpr] CMP          : NONE"

    # Trackers
    for t in verdict["trackers"]:
        yield f"[gdpr] TRACKER      : {t['name']}|{t['category']}|{str(t['schrems2']).lower()}"

    # Schrems II
    for name in verdict["schrems2_risk"]:
        yield f"[gdpr] SCHREMS2     : {name}"

    # Verdict
    yield f"[gdpr] VIOLATION    : {str(verdict['likely_violation']).lower()}"
    yield f"[gdpr] REASON       : {verdict['violation_reason']}"
    yield f"[gdpr] DPA          : {verdict['applicable_authority']}"
    yield f"[gdpr] SUMMARY      : {verdict['summary']}"
