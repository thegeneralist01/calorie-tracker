# Calorie Tracker - Product Specification

## Scope
- Full product specification (not MVP).
- Future-phase items are explicitly marked.

## Core Stack
- Framework: Astro (TypeScript).
- Styling: Tailwind CSS, responsive desktop/mobile.
- PWA: installable app shell, offline support, update toast.
- Validation: Zod.
- ORM/DB: Prisma + SQLite.
- Architecture: strict repository interfaces; Prisma isolated to infra adapter layer.
- Dev/deploy: Nix flakes for development and deployment.

## Navigation and Information Architecture
- Bottom navigation: Today | + | Settings.
- Today header right actions: calendar icon and profile emoji.
- Calendar opens history views: Day and Week.
- Profile emoji opens account profile page with stats, goals, badges.
- + action surface: meal/product tab-like switch at top; add-meal default.
- Settings is full preferences hub (units, reminders, auth/security, exports, integrations, etc.).

## Goals, Onboarding, and Targets
- Goal types: Lose Weight, Gain Weight, Maintain Weight, Build Muscle, Just Tracking.
- Onboarding: guided stepper.
- Auto-target path requires full physiology set.
- Just Tracking path allows manual targets.
- Calorie formula: user-selectable; default is Mifflin-St Jeor until changed.
- Build Muscle default strategy: small controlled surplus with high protein.
- Weight trend smoothing: 7-day moving average for suggestions.
- Goal adjustment cadence: weekly suggestions with bounded limits; user approval required.

## Time, Logging, and Diary Semantics
- Day boundary: user-configurable custom cutoff.
- Week semantics: strict calendar week with user-configurable week start.
- Meal categories: customizable with defaults (Breakfast/Lunch/Dinner/Snacks).
- Quantity entry: multi-unit + conversion metadata (grams, servings, pieces, ml).
- Precision: user-selectable precision policy.
- Water tracker: preset tap increments, bottle volume configurable in settings.
- Activities: dual-method entry only.
  - Direct calories input, or
  - Time/distance/intensity estimation (editable before save).

## Burned Calories
- Primary model: hybrid strategy (manual + synced sources).
- Current release: manual/estimated burn fully supported.
- Multi-source reconciliation rule: activity fingerprint merge.
- Apple Health integration: future-phase, post-launch.

## Product System
- Product layers: local user products + global catalog.
- Search behavior: local-first; include global results entry/button.
- Global import: one-tap clone into local library.
- Global correction propagation: notify user; optional sync to local clone.
- Identity model: composite identity (barcode + brand + region + version metadata).
- Governance: curated + versioned global catalog.
- Publish gate: label photo + admin moderation; no strict SLA.
- Partial nutrient products: publishable with warning badge.
- Missing nutrient completion: all users can propose; admins moderate.
- Contributor trust model: basic contribution history.
- Historical integrity: food logs store immutable nutrition snapshot at log time.

## AI Photo Estimation
- Opt-in required with explicit consent.
- User confirmation/edit required before saving estimated entry.
- Image retention: delete image after parsing; keep structured output only.
- Global catalog rule: AI-derived nutrition is never publishable globally.

## Authentication, Sessions, and Abuse Controls
- Auth: username/email + password.
- Session posture: very long-lived remembered devices.
- Sensitive actions require recent re-auth.
- Abuse escalation: progressive delay -> challenge -> one-time email verification when suspicious.
- Email verification required for publishing actions.
- Password recovery: self-serve email reset.
- Account deletion: self-serve with 14-day undo window.
- Post-deletion global data: keep published global products anonymized.
- Rate limiting enforced on auth and abuse-sensitive endpoints.

## Offline, Sync, and Reliability
- Offline guarantee: core offline logging (meals, water, activities).
- Conflict model: event merge.
- Deterministic merge: sort device actions by created_at ascending and replay.
- Retry policy: exponential backoff with retries and visible sync status.

## Analytics and Insights
- Scope: trend, correlation, and coaching insights.
- Recommendation explainability: always show rationale + confidence.
- Dashboard includes eaten/remaining/burned/macros and progress views.

## Social and Sharing
- No in-app social feed.
- Share model: external share cards only.
- Privacy controls: per-share metric scopes.
- Share artifact: image card.
- Card modes: goal progress presets.

## Internationalization
- Full multilingual architecture.
- Initial locales: English + German.
- Language selection: auto-detect with user override.
- Translation workflow: human-reviewed pipeline.

## Accessibility
- Target: minimal baseline for now.

## Data Export, Observability, and Ops
- User export: JSON + CSV.
- Observability: structured logs + alerts.
- Secrets management: agenix/sops-nix.
- Deployment topology: NixOS single node; Node runtime + SQLite + scheduled backups.
- SQLite durability mode: WAL + safe sync.
- Backup verification: checksum only.
- Recovery policy: no strict RTO/RPO enforced, but system should allow configuration.

## CI/CD and Test Strategy
- Test strategy: risk-based pyramid.
- Gate style: critical-path gating.
- PR checks: typecheck + lint + build + tests + dependency vulnerability scan.
- Promotion flow: PR checks, manual production deployment.
- Launch hard gate (strict combined):
  - Zero open P0/P1 defects in core flows.
  - Critical-flow test suite fully passing.
  - Core mobile interactions target p95 under 300ms.
  - Reliability/crash/error targets met.
  - Pilot cohort signoff required.

## Explicitly Deferred
- Apple Health integration (future-phase, post-launch).
- Additional wearable providers (future-phase).
