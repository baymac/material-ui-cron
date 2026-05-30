# TODOS

_Redesign follow-ups on `baymac/scheduler-segmented-controls` (PR #28, stacked on
PR1 #27). Final shape: segmented 2-way toggle for the mode selector, original
dropdowns for the value fields, per-instance store, lazy-loaded cron-parser._

## PR2 — Swap At/Every selectors to segmented pills + uppercase rows ✅
Replaced the per-field At/Every (On/Every) dropdowns with a segmented
`ToggleButtonGroup` (`SegmentedControl`) and restacked every row to an uppercase
label above wrapping controls (`FieldRow`).

## PR3 — Steppers + chip-pickers for field values ⟲ (built then reverted)
Built numeric steppers, chip-pickers, and toggle-chip groups for the value
fields, then **reverted on review**: the value selection stays as the original
dropdowns. Only the *mode selector* is a 2-way toggle (PR2); the *value* fields
(at/on multi-select, every-interval, between/and range, week/month) are the old
`CustomSelect` dropdowns. `Stepper`/`ChipMultiSelect`/`ToggleChipGroup`/
`RangePicker` and the `addLabel`/`anyDayLabel`/`everyMonthLabel` locale keys were
removed.

## Per-instance state (module-global atoms) ✅
Each `<Scheduler>` now mounts its own jotai `Provider`/store
(`SchedulerRoot.tsx`), so two instances on a page no longer stomp each other.
Removed the unmount-reset hack + localeRef workaround.

## DRY the field internals — not done (reverted with PR3)
The shared `RangePicker` was removed in the revert; Minute/Hour/DayOfMonth again
carry their own between/and range state. Re-do only alongside a future value-
control rework.

## Trim Next-runs bundle weight ✅
`computeNextRuns` dynamically imports `cron-parser` (and transitive `luxon`),
splitting it into a separate async chunk. Initial ESM entry dropped from
~240 KB gzip to ~61 KB gzip (cron-parser's ~180 KB gzip is deferred).

---

## Possible future work (not requested)
- Evaluate a lighter occurrence engine than cron-parser/luxon if the deferred
  ~180 KB chunk is still too heavy for some consumers.
- Revisit steppers/chip-pickers for the value fields only if there's appetite
  later (reverted this round); keep capability + the between/and range if so.
