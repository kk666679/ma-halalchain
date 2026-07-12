# TODO - HalalChain scaffold

- [x] Create `halalchain/tsconfig.json`
- [x] Create `halalchain/prisma/schema.prisma`
- [x] Create `halalchain/.env` and `.env.example`
- [x] Create `halalchain/Dockerfile` and `halalchain/docker-compose.yml`
- [x] Create `halalchain/README.md`
- [x] Create `halalchain/src/` base files (logger, prisma, ml, queues, trpc, middleware, server, client, exports)
- [ ] Fix TypeScript build errors:
  - [ ] PrismaClient typing/import compatibility (`@prisma/client` export)
  - [ ] tRPC router issues (imports, missing classifyIngredient import, sql usage)
  - [ ] BullMQ Redis type incompatibilities (use `as any` where needed)
  - [ ] Express/ pino-http typing concerns
- [ ] Update `halalchain/package.json` scripts (build/dev/start/test/lint/format/prisma)
- [ ] Run `npm ci && npm run build` and fix remaining issues
- [ ] Optionally run Prisma generate and start server

