# BlackWall

> Domain and IP intelligence terminal. Paste a target, watch it breach.

BlackWall is an OSINT aggregation tool built as a portfolio project. It accepts a domain or IP address and runs a suite of reconnaissance probes in parallel, streaming results to a cinematic card-based UI as each probe completes.

All data is sourced from publicly available APIs and services. No data is stored or transmitted beyond what is needed to perform each lookup.

---

## Features

### Probe suite

| Probe | Source | What it surfaces |
|-------|--------|-----------------|
| Geolocation | ip-api.com | IP address, ISP, ASN, city, country, timezone |
| WHOIS | python-whois | Registrar, registration date, expiry, nameservers. Flags recently registered domains. |
| DNS | dnspython | A, MX, NS records. Detects email provider (Google Workspace, Microsoft 365 etc.) and load balancing. |
| Subdomains | crt.sh | Certificate transparency log enumeration. Attack surface rating. |
| SSL/TLS | Python ssl module | Certificate expiry countdown, issuer context, subject alternative names. |
| Redirect chain | httpx | Full HTTP redirect path with CDN detection (Cloudflare, AWS, Akamai, Fastly). |
| GitHub | GitHub API + Brave Search | Organisation lookup, public repo count, followers, tech stack distribution chart. |
| HTTP Security Headers | httpx | Presence/absence of HSTS, CSP, X-Frame-Options and more — each with a plain-language vulnerability explanation. |
| GDPR Compliance | Static analysis | CMP detection (OneTrust, Cookiebot, Usercentrics etc.), tracker classification (analytics vs advertising), Schrems II risk flagging, DPA mapping by TLD, plain-language verdict. |

### UI
- Cinematic card layout — each card unlocks as its probe completes
- Geomap with animated markers (react-simple-maps)
- Tech stack distribution bar chart
- Contextual explanations on every card — readable by non-technical users
- GDPR verdict with red/amber/green badge system

---

## Stack

**Backend**
- Python 3.12+
- FastAPI with Server-Sent Events (SSE) streaming
- httpx, dnspython, python-whois

**Frontend**
- React + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- react-simple-maps

---

## Getting started

### Prerequisites
- Python 3.12+
- Node.js 18+
- A [Brave Search API](https://api.search.brave.com) key (free tier — 2000 req/month)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS / Linux

pip install -r requirements.txt
```

Create `backend/.env`:

```
BRAVE_API_KEY=your_key_here
```

Start the server:

```bash
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## Usage

1. Open `http://localhost:5173`
2. Enter a domain (e.g. `vg.no`, `finn.no`) or an IP address
3. Watch the probe cards unlock as results stream in

---

## Notes

- **IP-only targets** skip domain-specific probes (WHOIS, DNS, crt.sh, SSL, GitHub, GDPR)
- **GDPR analysis** is based on static HTML scanning only — JavaScript-loaded trackers and runtime consent flow require browser-level verification
- The Brave Search API key is only used for GitHub organisation lookup — the tool functions without it, but the GitHub probe will fail

---

## Disclaimer

All data surfaced by BlackWall is publicly available. This tool is intended for educational and research purposes only. The author accepts no responsibility for misuse.

---

*Built by Peter Brandal — work in progress.*
