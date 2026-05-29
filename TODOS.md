# TODOS

## PR2 — Swap field controls to pills / steppers / chips
**What:** Replace the per-field At/Every MUI dropdowns with segmented `ToggleButtonGroup`, numeric `Stepper`, and toggle `Chip`s to match the redesign mock (uppercase labels above controls).
**Why:** PR1 ships the new shell but keeps today's dropdown fields inside it; PR2 completes the visual redesign.
**Pros:** Matches the approved mock; better touch ergonomics; a11y/keyboard from MUI primitives.
**Cons:** Large diff across `src/fields/*`; the bare stepper can't express the "every N between X and Y" range — must add an "advanced range" affordance under "Every" or the stepper regresses `1-10/4` / multi-hour capability (Hour.tsx:134, DayOfMonth.tsx:143, Minute.tsx).
**Context:** Phasing decided in eng review 2026-05-29. PR1 = shell + Next-runs. Build on MUI `ToggleButtonGroup`/`Chip`/`IconButton`. Preserve the range/multi-select capability.
**Depends on:** PR1 merged.

## Per-instance state (module-global atoms)
**What:** Scope the Jotai atoms per `<Scheduler>` instance (Provider/store-per-instance) instead of module-level globals.
**Why:** Two `<Scheduler>` instances on one page currently share state and stomp each other; unmount-cleanup resets shared globals (Scheduler.tsx:124, store.ts:19).
**Pros:** Enables multiple independent schedulers on a page; removes the unmount-reset hack.
**Cons:** Touches every atom + selector + field; behavior-sensitive refactor with locale-restore subtleties (see prior learning on stale localized atoms).
**Context:** Pre-existing limitation, confirmed by prior learning + Codex outside voice. Out of scope for a UI redesign. NextRuns deliberately uses component-local state to avoid worsening this.
**Depends on:** none; independent.

## DRY the field internals
**What:** Extract the near-identical grid layout + range-disable effects shared by Minute/Hour/DayOfMonth into a shared abstraction.
**Why:** Minute.tsx / Hour.tsx / DayOfMonth.tsx duplicate `StyledGridContainer`, between/and range UI, and the start/end disable effects almost byte-for-byte.
**Pros:** Less drift risk; smaller field files; one place to fix range bugs.
**Cons:** Premature if done alone; best done while rewriting these controls.
**Context:** Bundle into PR2, which rewrites these controls anyway.
**Depends on:** PR2.

## Trim Next-runs bundle weight
**What:** Reduce the size cron-parser adds, or lazy-load it.
**Why:** cron-parser@5 depends on luxon; both are now bundled into the library (esm ~236KB gzip after this change). For a cron *editor*, a full datetime lib for a 5-row preview is heavy for consumers.
**Pros:** Smaller install for every consumer; faster first paint.
**Cons:** Lazy-loading adds async complexity to NextRuns; a lighter occurrence lib may not match cron-parser's dialect coverage (L, ranges).
**Context:** Introduced in PR1 (Next-runs). Options: dynamic import() of computeNextRuns so cron-parser is a separate chunk; or evaluate a lighter parser; or mark cron-parser as an optional peer. Measure with `yarn build` before/after.
**Depends on:** PR1 merged.
