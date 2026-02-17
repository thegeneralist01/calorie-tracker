# AGENTS.md

Guidance for coding agents working in this repository.

## Project Snapshot

- Stack: Astro 5 + TypeScript (strict) + Tailwind CSS + Prisma + SQLite.
- Runtime: Node adapter (`@astrojs/node`) with server output.
- Validation: Zod schemas for API payloads.
- Testing: Vitest (unit/schema) + Playwright (e2e).
- Package manager: npm.
- Product spec: `docs/SPEC.md`.

## Rule Files Check

- Cursor rules: none found (`.cursor/rules/` missing, `.cursorrules` missing).
- Copilot instructions: none found (`.github/copilot-instructions.md` missing).
- Therefore, follow this file + repository conventions inferred from source.

## Setup Commands

```bash
nix develop "path:."
npm install
cp .env.example .env
npm run prisma:generate
npm run db:push
npm run dev
```

Notes:
- On NixOS, run Prisma commands inside `nix develop`.
- Prisma config requires `DATABASE_URL` (`prisma.config.ts`).

## Build / Lint / Typecheck / Test

- Dev server: `npm run dev`
- Build: `npm run build`
- Typecheck: `npm run check`
- Lint gate: `npm run lint` (currently same as `check`)
- Unit tests: `npm run test`
- Unit tests watch: `npm run test:watch`
- E2E tests: `npm run test:e2e`
- E2E UI mode: `npm run test:e2e:ui`

## Single Test Commands (Important)

```bash
npx vitest run tests/domain/metrics.test.ts
npx vitest run tests/domain/metrics.test.ts -t "returns"
npx playwright test tests/e2e/auth-meal-flow.spec.ts
npx playwright test tests/e2e/auth-meal-flow.spec.ts --grep "user can register and log a meal"
```

## Database / Prisma Commands

- Generate Prisma client: `npm run prisma:generate`
- Sync schema (no migration files): `npm run db:push`
- Dev migration flow: `npm run db:migrate`
- Prisma Studio: `npm run db:studio`

Operational advice:
- After `prisma/schema.prisma` changes, run `npm run db:push` (or migration flow) before restart.
- Production DB path is usually from systemd `DATABASE_URL` (example: `file:/var/lib/calorie-tracker/dev.db`).

## Architecture Conventions

- Keep domain and infra separated:
  - Domain interfaces/types in `src/lib/domain/**`.
  - Prisma adapters/repositories in `src/lib/server/repositories/**`.
- API routes in `src/pages/api/**` should stay thin: auth guard -> parse/validate -> delegate -> normalized JSON response.

## API Route Patterns

- Use `APIRoute` handlers with explicit `GET/POST/DELETE/PATCH` exports.
- Auth check first (`if (!locals.user) return unauthorized();`).
- Parse request body with safe fallback:
  - `const payload = await request.json().catch(() => null)`
- Validate via Zod `safeParse` and return structured 400 errors.
- Return via shared helpers from `src/lib/server/http.ts` (`json`, `unauthorized`).

## TypeScript Style

- Strict TS config (`astro/tsconfigs/strict`).
- Prefer explicit types for public/domain boundaries and reducers.
- Use `type` imports where appropriate (`import type { APIRoute } from 'astro';`).
- Avoid `any`; if unavoidable in UI scripts, keep scope minimal.
- Keep function return types explicit in shared server/domain utilities.

## Formatting / Syntax Conventions

- Use single quotes in TS/JS.
- Use semicolons.
- 2-space indentation.
- Trailing commas in multiline objects/arrays where consistent.
- Keep lines readable; avoid dense one-liners for complex logic.

## Naming Conventions

- Files: kebab-case for modules (`prisma-log-repository.ts`).
- Types/interfaces: PascalCase (`LogRepository`, `MealLogInput`).
- Functions/variables: camelCase.
- Constants: UPPER_SNAKE_CASE for true constants (`SESSION_COOKIE_NAME`).
- Zod schemas: `<entity><Action>Schema` (`mealCreateSchema`, `settingsUpdateSchema`).

## Error Handling Guidelines

- Never throw raw errors in route handlers for expected validation/auth failures.
- Return actionable API errors with status codes:
  - 400 invalid payload
  - 401 unauthorized
  - 404 not found
- Keep user-facing messages clear and concise.
- Preserve optimistic UI safely (restore UI state on failed server mutation).

## Frontend / Astro Conventions

- Shared layout logic in `src/layouts/AppLayout.astro`.
- Client router enabled (`ClientRouter`); re-bind listeners on `astro:page-load`.
- Use `data-astro-prefetch` on key internal links.
- Keep interactive page scripts idempotent with binding guards.
- Maintain mobile behavior and accessibility (labels, roles, keyboard semantics).

## Testing Expectations For PRs

Minimum before finalizing changes:

```bash
npm run test
npm run check
```

Also run targeted tests for touched behavior:
- Unit/schema: specific `vitest` file(s)
- UI flows: relevant Playwright spec(s)

If `check` fails due local Prisma engine/client environment mismatch, document it clearly in the change summary.

## Commit & Change Hygiene

- Make focused commits by feature/fix.
- Do not include unrelated local changes.
- Update tests alongside behavior changes.
- When adding new settings/schema fields, wire all layers (Prisma schema, Zod schema, API GET/POST, UI load/submit).
