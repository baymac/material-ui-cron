# TODOS

## PR2 — Swap At/Every selectors to segmented pills + uppercase rows ✅ (first cut)
**What:** Replaced the per-field At/Every (On/Every) MUI dropdowns with a segmented `ToggleButtonGroup` (`SegmentedControl`) and restacked every row to an uppercase label above wrapping controls (`FieldRow`). Value/range dropdowns kept as-is, so zero capability loss.
**Status:** DONE — branch `baymac/scheduler-segmented-controls`, stacked on PR1. New: `SegmentedControl.tsx`, `FieldRow.tsx`; rewrote all 6 `src/fields/*`. 3 new browser tests; `vitest.config.mts` got `resolve.dedupe` (single React) to stop a late MUI-subpath optimize chunk from pulling a 2nd React.
**Context:** Targeted first cut chosen over the full stepper/chip rewrite (2026-05-29) to ship the mock's signature look with no range regression.

## PR3 — Steppers + chip-pickers for field values
**What:** Replace the value/range dropdowns themselves: numeric `Stepper` for "every N", chip-pickers (selected chips + add-menu) for At-mode minute/hour/day-of-month values, static toggle-`Chip` groups for week/month, and add the `Any day | On` (week) / `Every month | On` (month) segmented toggles the mock shows (no atom exists for these yet — new capability, not a swap).
**Why:** Completes the full visual redesign; PR2 shipped the pills but kept dropdowns for values.
**Cons:** The bare stepper can't express "every N between X and Y" — must add an "advanced range" affordance under "Every" or it regresses `1-10/4` / multi-hour capability (Hour.tsx, DayOfMonth.tsx, Minute.tsx). At-mode for 60 minutes / 24 hours / 31 days needs a real picker, not 60 static chips.
**Context:** The hard, capability-sensitive half deliberately split out of PR2. Bundle the "DRY field internals" TODO here since it rewrites these controls anyway.
**Depends on:** PR2 merged.

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
