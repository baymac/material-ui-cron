# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-05-30

### Added

- **React 18 support.** The `react` / `react-dom` peer dependency range is now
  `^18.0.0 || ^19.0.0` (previously pinned to `^19.2.0`). The component uses only
  standard hooks and works on both majors.
- **Calendar-based "Next runs" panel.** The preview is now a month calendar:
  days that have runs are highlighted, and selecting a day lists its run times
  (selecting an empty day shows "No runs on this day", localizable via the new
  optional `noRunsOnDayText` locale key). It enumerates **every** occurrence
  across the current month and the next two — not just the first handful — so
  sparse schedules are visible at a glance, and pages from the current month up
  to two months ahead. It opens to the soonest run's month with that day
  pre-selected.

### Fixed

- **JSX runtime was inlined into the published bundle**, hard-wiring it to the
  React version present at build time and crashing on React 18 with
  `Cannot read properties of undefined (reading 'recentlyCreatedOwnerStacks')`.
  `react` / `react-dom` subpaths (e.g. `react/jsx-runtime`) are now externalized,
  so the JSX runtime resolves from the consumer's own React at runtime.
- **`every N between X and Y` could silently collapse to a single run.** When the
  interval `N` exceeded the window span (e.g. `every 5 between :55 and :59` →
  `55-59/5`), the cron step landed outside the range after the first hit, so it
  only ever fired at `:55`. The selectable interval is now capped at the range
  span across the Minute / Hour / Day-of-month fields (options above the span are
  disabled, and a narrowing range clamps the interval down), so a window can no
  longer be made degenerate.

### Changed

- **Smaller bundle.** `@mui/icons-material` and `cron-parser` are now externalized
  instead of inlined. Every runtime dependency is external and resolved from the
  consumer's `node_modules` (deduping against existing copies). The ESM entry
  dropped from ~154 KB to ~43 KB gzip (CJS ~135 KB → ~40 KB gzip).
- **Tighter public types.** `CustomSelectProps` is now generic over the selected
  value type and `classes` is typed as MUI's `Partial<AutocompleteClasses>`,
  removing the `any` types from the public type surface.
- **Docs.** Reworked the README installation section to accurately describe the
  dependency model (MUI and the cron runtime ship as auto-installed regular
  dependencies kept external to the bundle — not inlined), and fixed the license
  badge link to point at the `main` branch.

### Migration from 1.x

No source changes are required. `material-ui-cron` 2.0 installs and runs on both
React 18 and React 19. The major bump reflects the bundle/packaging changes
(externalized JSX runtime, icons, and cron-parser) and the widened React range.

## [1.1.1] - Earlier releases

Earlier releases (1.1.1, 1.1.0, 1.0.0, and the `0.1.0-beta.*` line) predate this
changelog. See the [GitHub releases](https://github.com/baymac/material-ui-cron/releases)
and [tags](https://github.com/baymac/material-ui-cron/tags) for their history.

[2.0.0]: https://github.com/baymac/material-ui-cron/releases/tag/v2.0.0
[1.1.1]: https://github.com/baymac/material-ui-cron/releases/tag/v1.1.1
