import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      exclude: ['**/*.stories.*', '**/*.test.*'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MaterialUICron',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : 'cjs'}.js`,
    },
    rollupOptions: {
      // Externalize every runtime dependency + peer dependency so nothing
      // ships inlined in the bundle. `@mui/*`, `jotai`, `cronstrue`,
      // `cron-parser` are regular dependencies (auto-installed for the
      // consumer); react / react-dom / @emotion/* are peer dependencies.
      // Subpath imports (e.g. `@mui/icons-material/CalendarMonth`) are matched
      // via the regex entries below.
      external: [
        // Match subpaths too (`react/jsx-runtime`, `react-dom/client`, …) so the
        // JSX runtime is NOT inlined — otherwise the bundle hard-wires the React
        // version present at build time and crashes on older majors.
        /^react(\/.*)?$/,
        /^react-dom(\/.*)?$/,
        /^@mui\/material(\/.*)?$/,
        /^@mui\/system(\/.*)?$/,
        /^@mui\/icons-material(\/.*)?$/,
        /^@emotion\/react(\/.*)?$/,
        /^@emotion\/styled(\/.*)?$/,
        'jotai',
        'cronstrue',
        /^cron-parser(\/.*)?$/,
      ],
      output: {
        exports: 'named',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@mui/material': 'MaterialUI',
          '@mui/system': 'MUISystem',
          '@mui/icons-material': 'MaterialUIIcons',
          '@emotion/react': 'EmotionReact',
          '@emotion/styled': 'EmotionStyled',
          jotai: 'jotai',
          cronstrue: 'cronstrue',
          'cron-parser': 'cronParser',
        },
      },
      onwarn(warning, warn) {
        // Suppress "use client" directive warnings from MUI
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return;
        }
        warn(warning);
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  esbuild: {
    target: 'es2020',
  },
});
