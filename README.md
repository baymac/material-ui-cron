## Material UI Cron

[![npm package](https://img.shields.io/npm/v/material-ui-cron/latest.svg)](https://www.npmjs.com/package/material-ui-cron)
[![MIT License Badge](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/baymac/material-ui-cron/blob/master/LICENSE.md)

A React cron editor built with [material ui](https://material-ui.com/)

Live **demo** and **usage** at
[https://baymac.github.io/material-ui-cron/](https://baymac.github.io/material-ui-cron/?path=/story/material-ui-cron--scheduler-demo)

![material-ui-cron demo](/docs/material-ui-cron-demo.png)

## Inspired by

- [react-cron-js](https://github.com/xrutayisire/react-js-cron)

## Installation

Be sure that you have these dependencies on your project:

- react (>=17.0.1)
- @material-ui/core (>5.0.0-beta.1)
- @material-ui/styles: (>5.0.0-beta.1)

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

We are welcoming translation contributions from the community.

### How to contribute to translation

1. Clone `/src/localization/enLocal.ts` and rename it to desired langauge prefix
   (based on
   https://meta.wikimedia.org/wiki/Template:List_of_language_names_ordered_by_code).

2. Add language prefix to `definedLocales` type inside `/src/types.ts`

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

## Acknowledgement

This library was developed as a part of [Udaan](https://udaan.com/)'s Data
Platform for scheduling queries. Big thanks to
[Amod Malviya](https://github.com/amodm) for supporting this project.

## License

MIT © [baymac](https://github.com/baymac)
