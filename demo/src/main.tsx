import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { RouterProvider } from '@tanstack/react-router';
import { createRoot } from 'react-dom/client';
import { router } from './router';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1565c0' },
  },
});

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container #root not found');
}

// NOTE: React.StrictMode is intentionally omitted. The Scheduler keeps its cron
// state in module-level Jotai atoms and resets them in an unmount effect, so
// StrictMode's mount→unmount→remount cycle wipes the initial `cron` prop before
// the first paint (the field would show `0 0 * * *` instead of the passed value).
createRoot(container).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <RouterProvider router={router} />
  </ThemeProvider>,
);
