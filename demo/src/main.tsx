import { RouterProvider } from '@tanstack/react-router';
import { createRoot } from 'react-dom/client';
import { router } from './router';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container #root not found');
}

// The ThemeProvider + CssBaseline live in DemoPage so the page can own the
// light/dark mode toggle (the theme has to be created below the toggle state).
//
// NOTE: React.StrictMode is intentionally omitted. The Scheduler keeps its cron
// state in module-level Jotai atoms and resets them in an unmount effect, so
// StrictMode's mount→unmount→remount cycle wipes the initial `cron` prop before
// the first paint (the field would show `0 0 * * *` instead of the passed value).
createRoot(container).render(<RouterProvider router={router} />);
