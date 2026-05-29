/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        // Pure-logic unit tests (cron validation, selector derivations) run in Node.
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.ts'],
          exclude: ['src/**/*.browser.test.*'],
        },
      },
      {
        // Component tests render the real <Scheduler> in a real browser. jsdom is not
        // viable here — MUI's Autocomplete triggers an infinite update loop under jsdom.
        plugins: [react()],
        // Force a single React (and ReactDOM) instance. Without this, a
        // late-discovered MUI subpath import (e.g. ToggleButtonGroup, or an
        // icon) can be optimized into a separate dep chunk linked against a
        // second React copy, making every hook throw "Cannot read properties of
        // null (reading 'useContext')". Deduping keeps the dispatcher singular.
        resolve: {
          dedupe: ['react', 'react-dom'],
        },
        // Re-optimize deps every run so a warm cache that predates a newly added
        // MUI subpath import can't serve a stale chunk with a mismatched React
        // (the dup-React dispatcher-null failure). Costs ~1s of startup.
        optimizeDeps: {
          force: true,
        },
        test: {
          name: 'browser',
          include: ['src/**/*.browser.test.tsx'],
          setupFiles: ['./vitest.setup.browser.ts'],
          browser: {
            enabled: true,
            provider: 'playwright',
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.*',
        'src/**/*.browser.test.*',
        'src/**/*.stories.*',
        'src/**/*.d.ts',
        'src/index.ts',
        'src/types.ts',
      ],
      reporter: ['text', 'text-summary', 'html', 'json-summary'],
      reportsDirectory: './coverage',
    },
  },
});
