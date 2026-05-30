## Material UI Cron

[![npm package](https://img.shields.io/npm/v/material-ui-cron/latest.svg)](https://www.npmjs.com/package/material-ui-cron)
[![MIT License Badge](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/baymac/material-ui-cron/blob/main/LICENSE.md)
[![Live Demo](https://img.shields.io/badge/live-demo-000?logo=vercel)](https://material-ui-cron.vercel.app/)

A React cron editor built with [material ui](https://material-ui.com/)

![material-ui-cron demo](/docs/material-ui-cron-demo.png)

## Inspired by

- [react-cron-js](https://github.com/xrutayisire/react-js-cron)

## Installation

Be sure that you have these peer dependencies on your project:

- react (>=18.0.0, including 19)
- react-dom (>=18.0.0, including 19)
- @emotion/react (>=11.11.0)
- @emotion/styled (>=11.11.0)

MUI (`@mui/material`, `@mui/system`, `@mui/icons-material`) and the cron
runtime (`cron-parser`, `cronstrue`, `jotai`) ship as regular dependencies —
your package manager installs them automatically, and they're kept external to
the bundle so they dedupe against any copies already in your tree. You don't
need to add them yourself.

```bash
# Yarn
yarn add material-ui-cron

# NPM
npm install --save material-ui-cron
```

## Usage

```javascript
import Scheduler from 'material-ui-cron'
import React from 'react'

export default function SchedulerDemo() {
  const [cron, setCron] = React.useState('0 9 * * *')
  const [cronError, setCronError] = React.useState('') // validation error, '' when valid

  return (
    <Scheduler
      cron={cron}
      setCron={setCron}
      setCronError={setCronError}
    />
  )
}
```

📖 **See [USAGE.md](./USAGE.md) for the full guide** — every prop with examples:
[theming & dark mode](./USAGE.md#theming-the-color), [admin mode](./USAGE.md#admin-mode-sub-daily-frequencies),
[layout](./USAGE.md#layout), [title & header](./USAGE.md#title-and-header),
[timezone](./USAGE.md#timezone), and [localization](./USAGE.md#localization).

`material-ui-cron` is written in TypeScript and ships complete type definitions.

## Localization

The component ships with **English (`en`)** and **Chinese (`zh_CN`)**, selected
via the `locale` prop, or supply your own with `customLocale` — see
[Localization in USAGE.md](./USAGE.md#localization). Translation contributions
from the community are very welcome.

### Contributing a translation

1. Clone `/src/localization/enLocal.ts` and rename it to the desired language
   prefix (based on
   https://meta.wikimedia.org/wiki/Template:List_of_language_names_ordered_by_code).
2. Add the language prefix to the `definedLocales` type inside `/src/types.ts`
   (if required).
3. Add the locale mapping inside `/src/i18n.ts`.

## Testing

Tests run on [Vitest](https://vitest.dev/) and are split into two projects:

- **`unit`** — pure-logic tests that run in Node (cron validation in `utils.ts`,
  the cron ⇄ field-atom derivations in `selector.ts`).
- **`browser`** — component tests that render the real `<Scheduler />` in a
  headless Chromium via [Playwright](https://playwright.dev/). A real browser is
  required: MUI's `Autocomplete` triggers an infinite update loop under jsdom.

Tests live next to the code they cover:

| File | Project | What it covers |
| --- | --- | --- |
| `src/utils.test.ts` | unit | every cron-part validator + helpers |
| `src/selector.test.ts` | unit | all cron-part derivation atoms and the writer |
| `src/scheduler.browser.test.tsx` | browser | end-to-end `<Scheduler />` behaviour |

### Commands

```bash
# Install the Chromium browser once (needed for the browser project)
npx playwright install chromium

yarn test           # run the whole suite once (unit + browser)
yarn test:unit      # run only the Node unit project
yarn test:browser   # run only the Chromium browser project
yarn test:watch     # watch mode
yarn coverage       # run everything and emit a coverage report
```

`yarn coverage` uses the V8 provider and writes a report to `coverage/`
(`text` summary in the console, plus `html` and `json-summary`).

### Continuous integration

`.github/workflows/test.yml` runs on pushes and pull requests to `main`. It
lints (`biome lint`), type-checks (`tsc --noEmit`), builds, installs Chromium,
runs `yarn coverage`, and uploads the coverage report as a build artifact.

## Demo & deployment

The [`demo/`](./demo) app is deployed to Vercel, which builds a fresh preview for
**every branch and pull request** and comments the live URL on the PR.

The build is driven by [`vercel.json`](./vercel.json) at the repo root:

| Step | Command |
| --- | --- |
| Install | `yarn --cwd demo install` |
| Build | `yarn --cwd demo build` |
| Output | `demo/dist` |

### One-time Vercel setup

1. Create a Vercel project and link it to this GitHub repository
   (Vercel dashboard → *Add New… → Project*, or `npx vercel link`).
2. Leave the **Root Directory** as the repo root — `vercel.json` already points
   the build at `demo/`. (The demo aliases the library from `../src`, so the whole
   repo must be present at build time.)
3. That's it. Vercel's Git integration produces a Preview Deployment for each push
   to a branch / PR and a Production Deployment for `main`.

No secrets or GitHub Actions workflow are required — preview URLs come from
Vercel's native Git integration.

## Acknowledgement

This library was developed as a part of [Udaan](https://udaan.com/)'s Data
Platform for scheduling queries. Big thanks to
[Amod Malviya](https://github.com/amodm) for supporting this project.

## License

MIT © [baymac](https://github.com/baymac)
