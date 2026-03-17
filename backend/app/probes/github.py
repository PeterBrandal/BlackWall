import httpx

MAX_REPOS = 10


def _candidate_handles(domain: str) -> list[str]:
    """Generate org handle candidates from a domain.
    vg.no -> ['vgno', 'vg-no', 'vg_no', 'vg']
    github.com -> ['githubcom', 'github-com', 'github_com', 'github']
    """
    parts = domain.lower().split(".")
    name, tld = parts[0], parts[-1]
    return [
        f"{name}{tld}",    # vgno
        f"{name}-{tld}",   # vg-no
        f"{name}_{tld}",   # vg_no
        name,              # vg (fallback)
    ]


def _domain_matches_profile(domain: str, profile: dict) -> bool:
    """Check if a GitHub profile's website field matches our target domain."""
    website = (profile.get("blog") or profile.get("html_url") or "").lower()
    return domain.lower() in website


async def _find_best_org(client: httpx.AsyncClient, domain: str, name: str) -> dict | None:
    headers = {"Accept": "application/vnd.github+json"}
    base = "https://api.github.com"

    # Strategy 1: try all handle candidates (vgno, vg-no, vg_no, vg)
    for handle in _candidate_handles(domain):
        r = await client.get(f"{base}/orgs/{handle}", headers=headers)
        if r.status_code == 200:
            return r.json()
        # Also try as a user
        r = await client.get(f"{base}/users/{handle}", headers=headers)
        if r.status_code == 200:
            return r.json()

    # Strategy 2: search orgs by full domain (e.g. "vg.no")
    r2 = await client.get(
        f"{base}/search/users",
        headers=headers,
        params={"q": f"{domain} type:org", "per_page": 5},
    )
    if r2.status_code == 200:
        items = r2.json().get("items", [])
        for item in items:
            # Fetch full profile to check website field
            r_full = await client.get(f"{base}/orgs/{item['login']}", headers=headers)
            if r_full.status_code == 200:
                profile = r_full.json()
                if _domain_matches_profile(domain, profile):
                    return profile

    # Strategy 3: search by name, pick the org with most followers
    r3 = await client.get(
        f"{base}/search/users",
        headers=headers,
        params={"q": f"{name} type:org", "per_page": 5},
    )
    if r3.status_code == 200:
        items = r3.json().get("items", [])
        if items:
            # Fetch full profiles and pick highest followers
            profiles = []
            for item in items[:3]:
                r_full = await client.get(f"{base}/orgs/{item['login']}", headers=headers)
                if r_full.status_code == 200:
                    profiles.append(r_full.json())
            if profiles:
                return max(profiles, key=lambda p: p.get("followers", 0))

    # Strategy 4: fall back to user lookup
    r4 = await client.get(f"{base}/users/{name}", headers=headers)
    if r4.status_code == 200:
        return r4.json()

    return None


async def probe(target: str):
    name = _candidate_handles(target)[0]
    base = "https://api.github.com"
    headers = {"Accept": "application/vnd.github+json"}

    async with httpx.AsyncClient(headers=headers, timeout=15.0) as client:
        profile = await _find_best_org(client, target, name)

        if not profile:
            yield f"[github] No GitHub org/user found for: {target}"
            return

        login        = profile.get("login")
        account_type = "orgs" if profile.get("type") == "Organization" else "users"

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
