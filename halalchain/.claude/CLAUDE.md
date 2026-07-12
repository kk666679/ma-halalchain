# HalalChain – Agent Memory Layer

## 🧠 Architecture Rules
- **Monorepo structure**: `packages/` for core, `apps/` for frontend/backend, `infrastructure/` for DevOps.
- **API Gateway**: All external integrations (payments, logistics, blockchain) go through a single GraphQL gateway.
- **Blockchain Abstraction**: Smart contract interactions are wrapped in service classes (`src/services/blockchain/*`).
- **Event‑Driven**: Use Kafka for inter‑service communication; all agents emit/produce events.
- **Security**: PCI‑DSS for payments, Sharia‑compliance checks for token operations.

## 📛 Naming Conventions
- **Files**: `kebab-case` for configs, `PascalCase` for React components, `snake_case` for Python modules.
- **Environment Variables**: `UPPER_SNAKE_CASE` (e.g., `ETH_RPC_URL`).
- **Branches**: `feature/`, `fix/`, `chore/` prefix, e.g., `feature/payments-escrow`.
- **Commit messages**: Conventional Commits (`feat:`, `fix:`, `docs:`, etc.).

## 🧪 Test Expectations
- **Unit tests**: `jest` for JS/TS, `pytest` for Python. Coverage > 80%.
- **Integration tests**: For each integration skill (Payments, Logistics, etc.) – run against sandbox environments.
- **Smart contracts**: Use `hardhat test` for Solidity, `anchor test` for Solana.
- **E2E**: Cypress for UI flows; Postman/Newman for API contract tests.

## 🗺️ Repo Map (Key Paths)
```

/contracts         – Solidity/Anchor smart contracts
/src/api           – GraphQL resolvers & REST endpoints
/src/agents        – LangGraph agent definitions
/.intent/          – TanStack Intent skills (loaded by Claude)
/.claude/          – This directory (agent kit)
/infrastructure/   – K8s manifests, Helm charts, Terraform
/docs/             – Architecture decisions, integration guides

```

## 🤖 Agent‑Specific Memory
Claude, always load the matching `.claude/skills/**/SKILL.md` when the user mentions a specific domain (payments, logistics, etc.). Use the `@tanstack/intent` integration to discover skills.
