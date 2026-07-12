# HalalChain

This repository contains two related (but distinct) runnable parts:

1) **HalalChain app** (inside `halalchain/`)
- Node.js + Express + **tRPC** API
- PostgreSQL + **pgvector** for vector storage
- BullMQ + Redis for background jobs
- Runs on **http://localhost:3000**

2) **Agent Orchestrator stack** (root)
- IPFS + PostgreSQL + Kafka/Zookeeper + an “orchestrator” service
- Runs the orchestrator API on **http://localhost:8080**
- Exposes an MCP SSE endpoint on **http://localhost:8000/sse**

---

## HalalChain app (tRPC)

Docs: [`halalchain/README.md`](halalchain/README.md)

### Quickstart (Docker)

From repo root:

```bash
cd halalchain
docker compose up --build
```

Services:
- App: http://localhost:3000
- Postgres(pgvector): localhost:5432
- Redis: localhost:6379

### Environment variables
See `halalchain/.env.example` (copy to `.env` in `halalchain/`).

At minimum, the docker compose references:
- `DATABASE_URL`
- `REDIS_URL`
- `API_KEY`

---

## Agent Orchestrator stack (root)

Configuration: [`docker-compose.yml`](docker-compose.yml)

### Quickstart (Docker)

From repo root:

```bash
docker compose up --build
```

Then (optionally) use the provided deploy helper:

```bash
./deploy.sh
```

Services and ports:
- Orchestrator API: http://localhost:8080
- Orchestrator MCP SSE: http://localhost:8000/sse
- IPFS API: http://localhost:5001

### Environment variables
The root compose expects values from a root `.env` file (see `deploy.sh`):
- `ETH_RPC_URL`
- `PINATA_JWT`

---

## Useful links

- `halalchain/AGENTS.md`
- `halalchain/TODO.md`
- `deploy.sh` (root helper for orchestrator stack)

