import httpx

MAX_REPOS = 10


async def probe(target: str):
    headers = {"Accept": "application/vnd.github+json"}
    base = "https://api.github.com"

    async with httpx.AsyncClient() as client:

        r = await client.get(f"{base}/users/{target}")

        if r.status_code == 404:
            yield f"[github] User not found: {target}"
            return

        if r.status_code != 200:
            yield f"[github] FAILED — HTTP {r.status_code}"
            return
        
        u = r.json()
        
        yield f"[github] Login    : {u.get('login')}"
        yield f"[github] Name     : {u.get('name') or '—'}"
        yield f"[github] Bio      : {u.get('bio') or '—'}"
        yield f"[github] Location : {u.get('location') or '—'}"
        yield f"[github] Company  : {u.get('company') or '—'}"
        yield f"[github] Repos    : {u.get('public_repos')}  |  Followers: {u.get('followers')}  |  Following: {u.get('following')}"
        yield f"[github] Created  : {u.get('created_at', '')[:10]}"
        
        
        # --- Public Repos ---
        r2 = await client.get(
            f"{base}/users/repos",
            headers=headers,
            params={"sort": "updated", "per_page": MAX_REPOS},
            timeout=15,
        )
        
        if r2.status_code == 200:
            repos = r2.json()
            yield f"[github] --- Top {MAX_REPOS} repos (by last updated) ---"
            for repo in repos:
                stars = repo.get("stargazers_count", 0)
                lang = repo.get("language") or "—"
                yield f"[github] {repo['name']} [{lang}] ★{stars}"
        