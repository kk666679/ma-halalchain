# HalalChain

Full-stack halal verification system with AI (embeddings + QA), vector search (PostgreSQL + pgvector), and blockchain verification (stubbed).

## Stack

- **API**: tRPC + Express
- **DB**: PostgreSQL (+ pgvector extension)
- **Background jobs**: BullMQ + Redis
- **AI**:
  - Embeddings + QA via **@xenova/transformers**
  - Ingredient classification stub with deterministic heuristics + fallback

## Prerequisites

- Node.js 18+
- Docker (optional, for Postgres + Redis)

## Setup (local)

```bash
cd halalchain
cp .env.example .env
npm ci
npx prisma generate
```

## Run

### With Docker

```bash
docker compose up --build
```

### Without Docker

Start Postgres + Redis, set `DATABASE_URL` and `REDIS_URL`, then:

```bash
npm run dev
```

## API

tRPC endpoint: `http://localhost:3000/trpc`

