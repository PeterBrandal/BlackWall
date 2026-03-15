# BlackWall

A cyberpunk-themed OSINT reconnaissance terminal. Enter a target (IP address or domain) and BlackWall queries multiple open-source intelligence sources in real time, streaming results to a split terminal and geolocation map view.

Built as a portfolio project to explore async streaming, animated React UIs, and OSINT data aggregation.

![Stack](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![Stack](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Stack](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Stack](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

---

## Features

- Real-time streaming results via Server-Sent Events (SSE)
- Geolocation map that animates to the target's coordinates
- Cyberpunk terminal aesthetic with boot sequence, glitch effects, and CRT scanlines
- Modular probe architecture — easy to add new intelligence sources
- Docker Compose support for production-style deployment

---

## Probes

| Probe | Source | Status |
|-------|--------|--------|
| IP Geolocation | [ip-api.com](https://ip-api.com) | Live |
| Certificate Transparency | [crt.sh](https://crt.sh) | Live |
| Breach Check | [HaveIBeenPwned](https://haveibeenpwned.com/API/v3) | Planned |
| Threat Intelligence | [VirusTotal](https://www.virustotal.com) | Planned |
| Code Footprint | [GitHub](https://github.com) | Planned |
| Email Avatar | [Gravatar](https://gravatar.com) | Planned |
| Social Presence | [Reddit](https://www.reddit.com) | Planned |
| Web Presence | SerpAPI | Planned |

---

## Tech Stack

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) — async API framework
- [Uvicorn](https://www.uvicorn.org/) — ASGI server
- [httpx](https://www.python-httpx.org/) — async HTTP client

**Frontend**
- [React 18](https://react.dev/) + TypeScript
- [Vite](https://vitejs.dev/) — dev server and bundler
- [Tailwind CSS](https://tailwindcss.com/) — utility-first styling
- [Framer Motion](https://www.framer.com/motion/) — animations
- [React Simple Maps](https://www.react-simple-maps.io/) — geolocation visualization

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- Git

### Local Development

**1. Clone the repository**

```bash
git clone https://github.com/your-username/blackwall.git
cd blackwall
```

**2. Start the backend**

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate   # Windows (Git Bash)
# source .venv/bin/activate     # macOS / Linux
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.
Interactive docs at `http://localhost:8000/docs`.

**3. Start the frontend**

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

> The Vite dev server proxies `/api` requests to `http://localhost:8000`, so both services work together without any extra configuration.

---

### Docker (Production)

Requires [Docker](https://www.docker.com/) with the Compose plugin.

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | `http://localhost:80` |
| Backend API | `http://localhost:8000` |
| API Docs | `http://localhost:8000/docs` |

To stop:

```bash
docker compose down
```

---

## Environment Variables

Copy the example file and fill in values as probes are enabled:

```bash
cp .env.example .env
```

| Variable | Required By | Description |
|----------|-------------|-------------|
| *(none yet)* | — | API keys will be added here as probes are implemented |

---

## Project Structure

```
blackwall/
├── backend/
│   ├── main.py              # FastAPI app and SSE scan endpoint
│   ├── app/
│   │   └── probes/
│   │       ├── ip_api.py    # IP geolocation probe
│   │       └── crt_sh.py    # Certificate transparency probe
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Root component and boot sequence
│   │   ├── pages/
│   │   │   └── HomePage.tsx
│   │   ├── components/      # UI components (terminal, map, input, etc.)
│   │   ├── hooks/
│   │   │   └── useSSE.ts    # SSE connection management
│   │   └── lib/
│   │       └── utils.ts
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## API Reference

### `GET /health`

Returns the service status.

```json
{ "status": "online", "system": "BLACKWALL" }
```

### `GET /api/scan?target={target}`

Initiates a breach scan against the given target. Returns an SSE stream of probe results.

**Example:**

```bash
curl -N "http://localhost:8000/api/scan?target=8.8.8.8"
```

```
data: INITIATING BREACH ON TARGET: 8.8.8.8
data: PROBE [ip-api]
data: IP › 8.8.8.8
data: Location › Mountain View, California, US
data: [geo] 37.386,-122.0838
data: PROBE [crt.sh]
data: dns.google
data: SCAN COMPLETE
```

---

## License

MIT
