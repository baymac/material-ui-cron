# Usage

Complete guide to the `<Scheduler />` component — every prop, with examples for
each variation. For installation and a quick start, see the
[README](./README.md).

- [Import](#import)
- [Props](#props)
- [The controlled value](#the-controlled-value)
- [Admin mode (sub-daily frequencies)](#admin-mode-sub-daily-frequencies)
- [Theming the color](#theming-the-color)
  - [The `color` prop (accent only)](#the-color-prop-accent-only)
  - [A full MUI theme (dark mode, surfaces, dividers)](#a-full-mui-theme-dark-mode-surfaces-dividers)
  - [Combining both](#combining-both)
- [Layout](#layout)
- [Title and header](#title-and-header)
- [Timezone](#timezone)
- [Calendar](#calendar)
- [Localization](#localization)
  - [Predefined locale](#predefined-locale)
  - [Custom locale](#custom-locale)
- [Multiple schedulers on one page](#multiple-schedulers-on-one-page)
- [TypeScript](#typescript)

## Import

The component is the default export. Types are named exports.

```tsx
import Scheduler from 'material-ui-cron';
import type { SchedulerProps, SchedulerLayout, Locale, definedLocales } from 'material-ui-cron';
```

Each `<Scheduler />` manages its own internal state (it creates a private
[jotai](https://jotai.org/) store on mount), so you can drop several on the same
page without them stomping on each other — no provider or setup required.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `cron` | `string` | — **(required)** | The controlled cron expression (5-field, e.g. `0 9 * * *`). |
| `setCron` | `Dispatch<SetStateAction<string>>` | — **(required)** | Called with the new expression whenever the user edits the schedule. |
| `setCronError` | `Dispatch<SetStateAction<string>>` | — **(required)** | Called with the validation error message (empty string when valid). |
| `isAdmin` | `boolean` | `false` | Allows sub-daily frequencies (more than once a day). See [Admin mode](#admin-mode-sub-daily-frequencies). |
| `color` | `string` | theme primary | Accent color (header bar, selected toggle segment, section pills). Any CSS color. See [Theming](#theming-the-color). |
| `layout` | `'auto' \| 'split' \| 'stacked'` | `'auto'` | Responsive posture of the card. See [Layout](#layout). |
| `title` | `string` | locale value (`"Schedule"`) | Header title shown next to the calendar icon. |
| `timezone` | `string` | local zone | IANA timezone for the "Next runs" preview (e.g. `'America/New_York'`). |
| `locale` | `'en' \| 'zh_CN'` | `'en'` | A built-in translation. See [Localization](#localization). |
| `customLocale` | `Locale` | — | A full custom translation object. Overrides `locale`. |
| `slotProps` | `{ header?: { sx?: SxProps<Theme> } }` | — | Per-slot style overrides. See [Title and header](#title-and-header). |

## The controlled value

`<Scheduler />` is a fully controlled component. You own the cron string in
state and pass it down; the component reports edits back up through `setCron`,
and validation errors through `setCronError`.

```tsx
import Scheduler from 'material-ui-cron';
import React from 'react';

export default function Example() {
  const [cron, setCron] = React.useState('0 9 * * *'); // daily at 09:00
  const [cronError, setCronError] = React.useState('');

  return (
    <>
      <Scheduler cron={cron} setCron={setCron} setCronError={setCronError} />

      <pre>{cron}</pre>
      {cronError && <p style={{ color: 'crimson' }}>{cronError}</p>}
    </>
  );
}
```

Because it is controlled, you can drive it from anywhere — set `cron` to a
preset and the UI updates to match:

```tsx
<button onClick={() => setCron('*/15 * * * *')}>Every 15 minutes</button>
```

## Admin mode (sub-daily frequencies)

By default the editor only allows schedules that run **at most once a day**. Set
`isAdmin` to allow higher frequencies (every minute, every N minutes, hourly,
etc.):

```tsx
<Scheduler
  cron={cron}
  setCron={setCron}
  setCronError={setCronError}
  isAdmin // unlocks every-minute / every-hour options
/>
```

Leave it off (or `false`) to restrict end users to daily-or-coarser schedules.

## Theming the color

There are two ways to recolor the component, depending on how much you want to
control.

### The `color` prop (accent only)

The quickest way to a different look. `color` overrides the theme's
`palette.primary` for this card only — it recolors the **header bar**, the
**selected segment** of the At/Every & On/Every toggles, and the **single-value
section pills**. The contrast (text) color is recomputed from it automatically,
so text stays legible against whatever you pass.

```tsx
<Scheduler
  cron={cron}
  setCron={setCron}
  setCronError={setCronError}
  color="#7c3aed" // any CSS color: hex, rgb(), hsl(), or a named color
/>
```

### A full MUI theme (dark mode, surfaces, dividers)

The Scheduler reads from the standard MUI theme, so anything you set on a parent
`ThemeProvider` flows in — `palette.primary`, `palette.background.paper` (the
card surface), `palette.divider` (the row dividers and border), and
`palette.mode` for dark mode. Use this when you want more than just the accent,
or when you already have an app-wide theme.

```tsx
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark', // dark scheduler
    primary: { main: '#7c3aed' }, // accent
    background: { paper: '#1a1a1a' }, // card surface
  },
});

<ThemeProvider theme={theme}>
  <Scheduler cron={cron} setCron={setCron} setCronError={setCronError} />
</ThemeProvider>;
```

> **Tip:** if you render the scheduler inside a scoped dark region (rather than
> app-wide), wrap it in MUI's `<ScopedCssBaseline>` so its text and surface
> colors match an app-wide dark theme. The demo (`demo/src/pages/DemoPage.tsx`)
> does exactly this.

### Combining both

You can use both together: an app-wide `ThemeProvider` for dark mode / surfaces,
plus a per-instance `color` for the accent. They merge — the `color` prop is
applied in a scoped theme nested inside your provider, so it **wins** for
`palette.primary` while everything else (mode, background, dividers) comes from
your outer theme.

```tsx
<ThemeProvider theme={darkTheme}>
  {/* dark card, but with a teal accent just for this instance */}
  <Scheduler cron={cron} setCron={setCron} setCronError={setCronError} color="#14b8a6" />
</ThemeProvider>
```

## Layout

The card has a two-zone layout: the form on the left and the "Next runs" preview
on the right. `layout` controls how it responds to width. The card responds to
**its own width** (via a container query), not the viewport — so it adapts
correctly even inside a narrow column.

| Value | Behavior |
| --- | --- |
| `'auto'` *(default)* | Two columns; stacks to one column when the card is narrower than 720px. |
| `'split'` | Always two columns. |
| `'stacked'` | Always one column (Next-runs last). |

```tsx
<Scheduler cron={cron} setCron={setCron} setCronError={setCronError} layout="stacked" />
```

## Title and header

`title` sets the text next to the calendar icon in the header bar. It takes
precedence over the locale's title (which defaults to `"Schedule"`):

```tsx
<Scheduler cron={cron} setCron={setCron} setCronError={setCronError} title="Run report" />
```

Use `slotProps.header.sx` to style the header bar itself (a standard MUI `sx`
object):

```tsx
<Scheduler
  cron={cron}
  setCron={setCron}
  setCronError={setCronError}
  slotProps={{ header: { sx: { py: 2 } } }}
/>
```

## Timezone

The "Next runs" panel previews upcoming fire times. By default it uses the
viewer's local zone; pass an IANA timezone to preview against a specific one:

```tsx
<Scheduler
  cron={cron}
  setCron={setCron}
  setCronError={setCronError}
  timezone="America/New_York"
/>
```

## Calendar

The "Next runs" panel **is** a month calendar. Days that have at least one run
are highlighted; selecting a day lists its run times underneath. Selecting a day
with no runs shows a "No runs on this day" message (localizable via the
`noRunsOnDayText` locale key). On load it opens to the month of the soonest run
and pre-selects that day, so the panel shows the next fire times immediately.

The calendar enumerates **every** occurrence across the current month and the
next two, so even sparse or hard-to-read schedules — e.g. an interval over a
narrow window — are visible at a glance. Arrows page from the current month up to
two months ahead (never before the current month). It respects the same
`timezone` as the rest of the preview.

## Localization

The component ships with English (`en`) and Chinese (`zh_CN`). Translation
contributions are welcome — see the
[contributing notes](./README.md#contributing-a-translation).

### Predefined locale

```tsx
<Scheduler
  cron={cron}
  setCron={setCron}
  setCronError={setCronError}
  locale="zh_CN" // defaults to 'en' when omitted
/>
```

> When switching locale at runtime, give the component a `key={locale}` so it
> remounts and re-renders the field labels in the new language.

### Custom locale

Pass a full `Locale` object to supply your own strings. `customLocale` overrides
`locale` when both are given:

```tsx
import type { Locale } from 'material-ui-cron';

const myLocale: Locale = {
  /* ...a valid Locale object (see src/localization/enLocal.ts for the shape) */
};

<Scheduler
  cron={cron}
  setCron={setCron}
  setCronError={setCronError}
  customLocale={myLocale}
/>;
```

## Multiple schedulers on one page

No special handling needed — each instance is fully isolated. Render as many as
you like:

```tsx
<Scheduler cron={cronA} setCron={setCronA} setCronError={setErrorA} title="Backup" />
<Scheduler cron={cronB} setCron={setCronB} setCronError={setErrorB} title="Report" color="#e11d48" />
```

## TypeScript

`material-ui-cron` is written in TypeScript and ships complete type definitions.
The prop type is exported as `SchedulerProps`:

```tsx
import type { SchedulerProps } from 'material-ui-cron';

const props: SchedulerProps = {
  cron,
  setCron,
  setCronError,
  color: '#7c3aed',
  layout: 'split',
};
```
