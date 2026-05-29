# material-ui-cron · demo

A small [TanStack Router](https://tanstack.com/router) + [Vite](https://vitejs.dev/)
single-page app that demos the `material-ui-cron` component.

It imports the library **straight from the repo source** (`../src`) via a Vite
alias, so the demo always reflects the current working tree — no build or
`npm link` step required.

## Run locally

```bash
# from the repo root
yarn demo            # installs nothing; runs `yarn --cwd demo dev`

# or directly
cd demo
yarn install
yarn dev             # http://localhost:5173
```

Other scripts (run inside `demo/`):

```bash
yarn build           # production build → demo/dist
yarn preview         # preview the production build
yarn typecheck       # tsc --noEmit
```

## Deployment (Vercel)

Preview deployments for every branch and pull request are produced by Vercel's
native Git integration. The build is configured by `vercel.json` at the repo
root:

- **Install:** `yarn --cwd demo install`
- **Build:** `yarn --cwd demo build`
- **Output:** `demo/dist`

See the root `README.md` → *Demo & deployment* for the one-time Vercel setup.
