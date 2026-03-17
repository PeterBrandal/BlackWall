import httpx
import os
import re

MAX_REPOS = 10

GITHUB_BLOCKLIST = {
    "login", "signup", "about", "explore", "topics", "trending",
    "marketplace", "pricing", "features", "contact", "readme",
}


def _candidate_handles(domain: str) -> list[str]:
    parts = domain.lower().split(".")
    name, tld = parts[0], parts[-1]
    return [
        f"{name}{tld}",   # vgno
        f"{name}-{tld}",  # vg-no
        f"{name}_{tld}",  # vg_no
        name,             # vg
    ]


def _closest(candidates: list[str], domain: str) -> str | None:
    """Pick the candidate most similar to the domain name."""
    name = domain.split(".")[0].lower()
    scored = sorted(candidates, key=lambda h: sum(c in h for c in name), reverse=True)
    return scored[0] if scored else None


async def _brave_search_org(domain: str) -> str | None:
    api_key = os.getenv("BRAVE_API_KEY")
    if not api_key:
        return None

    query = f"{domain} github"
    headers = {
        "Accept": "application/json",
        "X-Subscription-Token": api_key,
    }

    async with httpx.AsyncClient() as client:
        try:
            r = await client.get(
                "https://api.search.brave.com/res/v1/web/search",
                headers=headers,
                params={"q": query, "count": 5},
                timeout=8.0,
            )
        except httpx.TimeoutException:
            return None

    if r.status_code != 200:
        return None

    results = r.json().get("web", {}).get("results", [])

    handles = []
    for result in results:
        url = result.get("url", "")
        match = re.search(r"github\.com/([a-zA-Z0-9_-]+)", url)
        if match:
            handle = match.group(1)
            if handle.lower() not in GITHUB_BLOCKLIST:
                handles.append(handle)

    return _closest(handles, domain) if handles else None


async def probe(target: str):
    base = "https://api.github.com"
    headers = {"Accept": "application/vnd.github+json"}

    async with httpx.AsyncClient(headers=headers, timeout=15.0) as client:

        # Strategy 1: Brave search — most reliable
        handle = await _brave_search_org(target)

        # Strategy 2: fall back to pattern candidates
        if not handle:
            for candidate in _candidate_handles(target):
                r = await client.get(f"{base}/orgs/{candidate}")
                if r.status_code == 200:
                    handle = candidate
                    break

        if not handle:
            yield f"[github] No GitHub org found for: {target}"
            return

        # Resolve as org first, then user
        r = await client.get(f"{base}/orgs/{handle}")
        account_type = "orgs"
        if r.status_code == 404:
            r = await client.get(f"{base}/users/{handle}")
            account_type = "users"

        if r.status_code != 200:
            yield f"[github] Could not resolve handle: {handle}"
            return

        profile = r.json()
        login = profile.get("login")

        yield f"[github] Handle   : {login}"
        yield f"[github] Name     : {profile.get('name') or '—'}"
        yield f"[github] Website  : {profile.get('blog') or '—'}"
        yield f"[github] Repos    : {profile.get('public_repos', 0)}"
        yield f"[github] URL      : {profile.get('html_url')}"

        # Fetch top repos
        r_repos = await client.get(
            f"{base}/{account_type}/{login}/repos",
            params={"sort": "stars", "per_page": MAX_REPOS},
        )

        if r_repos.status_code != 200:
            return

        repos = r_repos.json()
        lang_counts: dict[str, int] = {}

        for repo in repos:
            lang = repo.get("language")
            if lang:
                lang_counts[lang] = lang_counts.get(lang, 0) + 1
            stars = repo.get("stargazers_count", 0)
            yield f"[github] {repo['name']} [{lang or '—'}] ★{stars}"

        if lang_counts:
            total = sum(lang_counts.values())
            sorted_langs = sorted(lang_counts.items(), key=lambda x: x[1], reverse=True)
            lang_str = "|".join(
                f"{lang}:{round(count / total * 100)}"
                for lang, count in sorted_langs
            )
            yield f"[github:langs] {lang_str}"
