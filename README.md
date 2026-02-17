# Calorie Tracker

Astro-based calorie and nutrition tracker with:
- PWA offline-first behavior
- Tailwind CSS UI
- Prisma + SQLite data model
- Zod validation
- TypeScript and Vitest tests
- Nix flakes for development and deployment workflows

The detailed functional product spec is in `docs/SPEC.md`.

## Quick Start

```bash
nix develop "path:."
npm install
cp .env.example .env
npm run prisma:generate
npm run db:push
npm run dev
```

Open `http://localhost:4321`.

## Scripts

- `npm run dev` - start local dev server
- `npm run check` - Astro type checks
- `npm run lint` - lint gate (currently Astro check)
- `npm run test` - run Vitest with coverage
- `npm run test:e2e` - run Playwright auth+meal flow
- `npm run build` - typecheck and production build
- `npm run prisma:generate` - generate Prisma client
- `npm run db:push` - sync schema to SQLite
- `npm run db:migrate` - create/apply migration in dev
- `npm run db:studio` - open Prisma Studio

## Nix Development

This repo includes `flake.nix`.

```bash
nix develop "path:."
```

The dev shell provides Node, SQLite, OpenSSL, and Prisma engine env vars for Nix-based development.

If Prisma CLI commands fail outside Nix (common on NixOS due engine resolution), run them inside `nix develop`.

If Playwright cannot launch due missing host libraries, run e2e tests inside a shell that includes browser dependencies, or install the required libs and run:

```bash
npx playwright install chromium
```

## CI/CD

- CI workflow: `.github/workflows/ci.yml`
  - install, prisma generate, check, lint, test, build, dependency scan
- Deploy workflow: `.github/workflows/deploy.yml`
  - manual trigger, build artifact upload for controlled production promotion

## Deploy Troubleshooting

- If production logs show `ERR_MODULE_NOT_FOUND` for `dist/server/pages/*.astro.mjs` (for example `/login`), the deployed `dist` is incomplete or stale.
- Always replace the full `dist` directory atomically during deploy (do not merge into an existing `dist`).
- Recommended sequence on the host: remove old `dist`, extract new artifact, then restart service.
