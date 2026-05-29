import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The demo consumes the library straight from source (`../src`) rather than the
// published package. This keeps the demo always in sync with the working tree,
// gives full HMR while editing the library, and needs no build step.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'material-ui-cron': resolve(__dirname, '../src/index.ts'),
    },
    // The library source imports these; make sure a single copy is used so React
    // hooks and Emotion's cache behave correctly.
    dedupe: [
      'react',
      'react-dom',
      'jotai',
      '@emotion/react',
      '@emotion/styled',
      '@mui/material',
      '@mui/system',
    ],
  },
});
