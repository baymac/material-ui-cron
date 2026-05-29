# TODOS

_All redesign follow-ups are now implemented on `baymac/scheduler-segmented-controls`
(PR #28, stacked on PR1 #27). Kept here as a changelog; nothing outstanding._

## PR2 — Swap At/Every selectors to segmented pills + uppercase rows ✅
Replaced the per-field At/Every (On/Every) dropdowns with a segmented
`ToggleButtonGroup` (`SegmentedControl`) and restacked every row to an uppercase
label above wrapping controls (`FieldRow`).

## PR3 — Steppers + chip-pickers for field values ✅
- every-mode interval → numeric `Stepper`
- at/on-mode values → `ChipMultiSelect` (selected chips + add-menu; single-pick
  for non-admins)
- week/month → `ToggleChipGroup` + derived `Any day` / `Every month` segmented
  toggles (all-selected == cron `*`, no new atom)
- "every N between X and Y" preserved as the advanced `RangePicker` affordance
All controls route through the existing atom setters, so cron serialization is
unchanged. New optional locale keys (`addLabel` / `anyDayLabel` /
`everyMonthLabel`) with English fallback.

## Per-instance state (module-global atoms) ✅
Each `<Scheduler>` now mounts its own jotai `Provider`/store
(`SchedulerRoot.tsx`), so two instances on a page no longer stomp each other.
Removed the unmount-reset hack + localeRef workaround.

## DRY the field internals ✅
Extracted the duplicated between/and range UI + start/end disable effects from
Minute/Hour/DayOfMonth into the shared `RangePicker`.

## Trim Next-runs bundle weight ✅
`computeNextRuns` dynamically imports `cron-parser` (and transitive `luxon`),
splitting it into a separate async chunk. Initial ESM entry dropped from
~240 KB gzip to ~61 KB gzip (cron-parser's ~180 KB gzip is deferred).

---

## Possible future work (not requested)
- Evaluate a lighter occurrence engine than cron-parser/luxon if the deferred
  ~180 KB chunk is still too heavy for some consumers.
- Consider exposing the new controls (`Stepper`, `ChipMultiSelect`, etc.) or
  their styling via `slotProps` for deeper host theming.
