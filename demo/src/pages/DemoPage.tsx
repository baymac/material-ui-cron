import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import GitHubIcon from '@mui/icons-material/GitHub';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import {
  Alert,
  AppBar,
  Box,
  Chip,
  Container,
  CssBaseline,
  FormControlLabel,
  Link,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import cronstrue from 'cronstrue';
import 'cronstrue/locales/zh_CN';
import { useMemo, useState } from 'react';
import Scheduler, { type definedLocales } from 'material-ui-cron';

const PRESETS: { label: string; cron: string }[] = [
  { label: 'Every minute', cron: '* * * * *' },
  { label: 'Every 15 minutes', cron: '*/15 * * * *' },
  { label: 'Hourly', cron: '0 * * * *' },
  { label: 'Daily at 09:00', cron: '0 9 * * *' },
  { label: 'Weekdays at 18:30', cron: '30 18 * * 1-5' },
  { label: 'Monthly (1st)', cron: '0 0 1 * *' },
  { label: 'Yearly (Jan 1)', cron: '0 0 1 1 *' },
];

const LOCALES: { value: definedLocales; label: string }[] = [
  { value: 'en', label: 'English (en)' },
  { value: 'zh_CN', label: '中文 (zh_CN)' },
];

// Approximate iPhone viewport width; narrow enough to trip the Scheduler's
// container queries (which respond to the card's own width, not the viewport).
const MOBILE_WIDTH = 390;

// The demo site itself always stays light; only the Scheduler preview flips to
// dark (via a nested ThemeProvider) so you can see the component in dark mode
// without recoloring the surrounding page.
const PAGE_THEME = createTheme({ palette: { mode: 'light', primary: { main: '#1565c0' } } });

type ViewMode = 'desktop' | 'mobile';

function describe(cron: string, locale: definedLocales): string {
  try {
    return cronstrue.toString(cron, {
      locale: locale === 'zh_CN' ? 'zh_CN' : 'en',
      throwExceptionOnParseError: true,
    });
  } catch {
    return '—';
  }
}

export function DemoPage() {
  const [cron, setCron] = useState('0 9 * * *');
  const [cronError, setCronError] = useState('');
  const [isAdmin, setIsAdmin] = useState(true);
  const [locale, setLocale] = useState<definedLocales>('en');
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [view, setView] = useState<ViewMode>('desktop');

  // Theme applied ONLY to the Scheduler preview (nested ThemeProvider below).
  // The page keeps PAGE_THEME (light) regardless of this toggle.
  const schedulerTheme = useMemo(
    () => createTheme({ palette: { mode, primary: { main: '#1565c0' } } }),
    [mode],
  );

  const isMobile = view === 'mobile';

  return (
    <ThemeProvider theme={PAGE_THEME}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar
          position="static"
          color="default"
          elevation={0}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
              material-ui-cron
            </Typography>
            <Link
              href="https://www.npmjs.com/package/material-ui-cron"
              target="_blank"
              rel="noopener"
              underline="hover"
              sx={{ mr: 2 }}
            >
              npm
            </Link>
            <Link
              href="https://github.com/baymac/material-ui-cron"
              target="_blank"
              rel="noopener"
              sx={{ display: 'inline-flex', alignItems: 'center', color: 'text.primary' }}
            >
              <GitHubIcon />
            </Link>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ py: 5 }}>
          <Stack spacing={1} sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              A React cron editor, built with Material UI
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Edit the schedule below, try a preset, toggle admin mode, switch the locale, preview
              the component in dark mode, or check the mobile layout. The component is rendered
              straight from this repository's <code>src/</code>.
            </Typography>
          </Stack>

          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ mb: 3 }}
              alignItems={{ sm: 'center' }}
              useFlexGap
              flexWrap="wrap"
            >
              <FormControlLabel
                control={<Switch checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />}
                label="Admin (allow sub-daily frequency)"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={mode === 'dark'}
                    onChange={(e) => setMode(e.target.checked ? 'dark' : 'light')}
                  />
                }
                label="Dark mode (scheduler only)"
              />
              <TextField
                select
                size="small"
                label="Locale"
                value={locale}
                onChange={(e) => setLocale(e.target.value as definedLocales)}
                sx={{ minWidth: 180 }}
              >
                {LOCALES.map((l) => (
                  <MenuItem key={l.value} value={l.value}>
                    {l.label}
                  </MenuItem>
                ))}
              </TextField>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={view}
                onChange={(_, next: ViewMode | null) => next && setView(next)}
                aria-label="preview viewport"
                sx={{ ml: { sm: 'auto' } }}
              >
                <ToggleButton value="desktop" aria-label="desktop view">
                  <DesktopWindowsIcon fontSize="small" sx={{ mr: 0.5 }} />
                  Desktop
                </ToggleButton>
                <ToggleButton value="mobile" aria-label="mobile view">
                  <PhoneIphoneIcon fontSize="small" sx={{ mr: 0.5 }} />
                  Mobile
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            {/* Only the Scheduler preview gets the light/dark theme; the page
                stays light. In mobile view the card is constrained to a
                phone-width frame so the Scheduler's container queries kick in
                (stacked layout, wrapped header) — the page viewport is
                unchanged. */}
            <ThemeProvider theme={schedulerTheme}>
              <Box
                sx={{
                  // Match the preview's own theme so dark mode reads as a dark
                  // surface even though the surrounding page is light. In
                  // desktop mode the box is flush with the card (no padding), so
                  // it's invisible; in mobile mode it's the phone-width frame.
                  bgcolor: 'background.default',
                  ...(isMobile
                    ? {
                        width: MOBILE_WIDTH,
                        maxWidth: '100%',
                        mx: 'auto',
                        p: 1,
                        borderRadius: 4,
                        border: 2,
                        borderColor: 'divider',
                      }
                    : {}),
                }}
              >
                <Scheduler
                  // `key` forces a clean remount when the locale changes so the field
                  // labels re-render in the new language.
                  key={locale}
                  cron={cron}
                  setCron={setCron}
                  setCronError={setCronError}
                  isAdmin={isAdmin}
                  locale={locale}
                />
              </Box>
            </ThemeProvider>
          </Paper>

          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
            <Typography variant="overline" color="text.secondary">
              Presets
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
              {PRESETS.map((p) => (
                <Chip
                  key={p.cron}
                  label={p.label}
                  onClick={() => setCron(p.cron)}
                  color={cron === p.cron ? 'primary' : 'default'}
                  variant={cron === p.cron ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="overline" color="text.secondary">
              Current value
            </Typography>
            <Box
              component="pre"
              sx={{
                m: 0,
                mt: 1,
                p: 1.5,
                borderRadius: 1,
                bgcolor: 'action.hover',
                fontFamily: 'monospace',
                fontSize: '1.1rem',
              }}
            >
              {cron}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              {describe(cron, locale)}
            </Typography>
            {cronError ? (
              <Alert severity="error" sx={{ mt: 2 }}>
                {cronError}
              </Alert>
            ) : null}
          </Paper>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
            <Link
              href="https://github.com/baymac/material-ui-cron#usage"
              target="_blank"
              rel="noopener"
            >
              Read the usage docs →
            </Link>
          </Typography>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
