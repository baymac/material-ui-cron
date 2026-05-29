## Material UI Cron

[![npm package](https://img.shields.io/npm/v/material-ui-cron/latest.svg)](https://www.npmjs.com/package/material-ui-cron)
[![MIT License Badge](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/baymac/material-ui-cron/blob/master/LICENSE.md)

A React cron editor built with [material ui](https://material-ui.com/)

For a **live demo**, run the demo app in [`demo/`](./demo):

```bash
yarn demo:install   # one-time: install the demo app's deps
yarn demo           # http://localhost:5173
```

The demo is a small [TanStack Router](https://tanstack.com/router) + Vite SPA that
imports the component straight from `src/`, so it always reflects the working tree.

![material-ui-cron demo](/docs/material-ui-cron-demo.png)

## Inspired by

- [react-cron-js](https://github.com/xrutayisire/react-js-cron)

## Installation

Be sure that you have these dependencies on your project:

- react (>=18.0.0)
- @mui/material (>=5.15.0)
- @emotion/react (>=11.11.0)
- @emotion/styled (>=11.11.0)

More dependencies

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
  const [cronExp, setCronExp] = React.useState('0 0 * * *')
  const [cronError, setCronError] = React.useState('') // get error message if cron is invalid
  const [isAdmin, setIsAdmin] = React.useState(true) // set admin or non-admin to enable or disable high frequency scheduling (more than once a day)

  return (
    <Scheduler
      cron={cronExp}
      setCron={setCronExp}
      setCronError={setCronError}
      isAdmin={isAdmin}
    />
  )
}
```

## TypeScript

`material-ui-cron` is written in TypeScript with complete definitions.

## Internalization and Localization

This library supports Internalization (i18n). Currently languages supported are:

1. English
2. Chinese

We are welcoming translation contributions from the community.

### How to contribute to translation

1. Clone `/src/localization/enLocal.ts` and rename it to desired langauge prefix
   (based on
   https://meta.wikimedia.org/wiki/Template:List_of_language_names_ordered_by_code).

2. Add language prefix to `definedLocales` type inside `/src/types.ts` (if required)

3. Add locale mapping inside `/src/i18n.ts`

### How to use translation

#### Using predefined locale:

```javascript
<Scheduler
  cron={cronExp}
  setCron={setCronExp}
  setCronError={setCronError}
  isAdmin={isAdmin}
  locale={'en'} // if not supplied, localization defaults to en
/>
```

#### Using custom locale:

```javascript
<Scheduler
  cron={cronExp}
  setCron={setCronExp}
  setCronError={setCronError}
  isAdmin={isAdmin}
  customLocale={{...your translations}} // should be a valid object of type Locale, overrides value supplied to locale prop
/>
```

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
