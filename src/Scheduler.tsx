import Box from '@mui/material/Box';
import { ThemeProvider, createTheme, styled, useTheme } from '@mui/material/styles';
import React from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import SchedulerHeader from './components/SchedulerHeader';
import NextRuns from './components/NextRuns';
import RunCalendar from './components/RunCalendar';
import CronReader from './components/CronReader';
import DayOfMonth from './fields/DayOfMonth';
import Hour from './fields/Hour';
import Minute from './fields/Minute';
import Month from './fields/Month';
import Period from './fields/Period';
import Week from './fields/Week';
import { supportedLanguages } from './i18n';
import {
  cronExpInputState,
  cronValidationErrorMessageState,
  dayOfMonthAtEveryState,
  hourAtEveryState,
  isAdminState,
  localeState,
  minuteAtEveryState,
  monthState,
  periodState,
  weekState,
} from './store';
import type { SchedulerProps } from './types';
import { getPeriodIndex } from './utils';
import {
  atEveryOptions,
  getPeriodOptions,
  getMonthOptions,
  onEveryOptions,
  weekOptions,
} from './constants';
import type { SelectOptions } from './types';

// Card root establishes the container-query context so the layout responds to
// its OWN width, not the viewport (this is a library card that can live in any
// container). The Grid below queries `@container`.
const Root = styled(Box)(({ theme }) => ({
  containerType: 'inline-size',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 12,
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
}));

// Two-zone layout: form (left) + Next-runs (right). `data-layout` controls the
// responsive posture:
//   auto    -> container query stacks it under 720px (default)
//   split   -> always two columns
//   stacked -> always one column (Next-runs last)
const Grid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 300px',
  '& > .form-col': {
    borderRight: `1px solid ${theme.palette.divider}`,
    // No inner padding here: CronReader (summary) and each FieldRow own their
    // own 16px horizontal padding, so the FieldRow top-border dividers span the
    // full column width (flush rows, matching the mock).
    padding: '4px 0',
  },
  '&[data-layout="auto"]': {
    '@container (max-width: 720px)': {
      gridTemplateColumns: '1fr',
      '& > .form-col': { borderRight: 'none' },
    },
  },
  '&[data-layout="stacked"]': {
    gridTemplateColumns: '1fr',
    '& > .form-col': { borderRight: 'none' },
  },
}));

// Right zone: the Next-runs list plus (optionally) the calendar, stacked within
// the fixed-width column. `min-width: 0` lets it shrink when the layout stacks.
const SideCol = styled(Box)({ minWidth: 0 });

const FormCol = styled(Box)({
  minHeight: 'min-content',
  // A grid item defaults to `min-width: auto`, so a too-wide field row (the
  // "every … between X and Y" range UI) would force the whole card past its
  // container and spill off-page. `min-width: 0` lets the column shrink; the
  // FieldRow controls now `flex-wrap` so the wide range row wraps instead of
  // overflowing. `overflow-x: auto` stays as a final safety net.
  minWidth: 0,
  overflowX: 'auto',
});

export default function Scheduler(props: SchedulerProps) {
  const { cron, setCron, setCronError, isAdmin, locale, customLocale } = props;
  const { timezone, layout = 'auto', slotProps, title, color, showCalendar } = props;
  const period = useAtomValue(periodState);
  const [periodIndex, setPeriodIndex] = React.useState(0);

  // Recolor everything that reads `palette.primary` (header bar, the selected
  // segment of the toggles, the section pills) by overriding primary in a
  // scoped theme. `augmentColor` derives light/dark/contrastText from the
  // single color so the contrast (text) color stays legible against it — we
  // must augment up front because createTheme's merge args are NOT re-augmented.
  // `useTheme()` always yields a theme (the default one when there is no parent
  // ThemeProvider), so we merge onto it directly instead of the function form,
  // which warns under MUI when no outer theme is present.
  const outerTheme = useTheme();
  const accentTheme = React.useMemo(() => {
    if (!color) {
      return undefined;
    }
    return createTheme(outerTheme, {
      palette: { primary: outerTheme.palette.augmentColor({ color: { main: color } }) },
    });
  }, [outerTheme, color]);

  const cronError = useAtomValue(cronValidationErrorMessageState);
  const setIsAdmin = useSetAtom(isAdminState);

  const [cronExpInput, setCronExpInput] = useAtom(cronExpInputState);
  const setResolvedLocale = useSetAtom(localeState);
  const currentLocale = useAtomValue(localeState);

  // Setters used by the locale re-map effect below. (No unmount-reset setters
  // are needed anymore: each instance has its own jotai store via the Provider
  // in SchedulerRoot, so state is discarded with the store on unmount.)
  const setWeek = useSetAtom(weekState);
  const setMonth = useSetAtom(monthState);
  const setPeriod = useSetAtom(periodState);
  const setMinuteAtEvery = useSetAtom(minuteAtEveryState);
  const setHourAtEvery = useSetAtom(hourAtEveryState);
  const setDayOfMonthAtEvery = useSetAtom(dayOfMonthAtEveryState);

  React.useEffect(() => {
    setCronError(cronError);
  }, [cronError, setCronError]);

  React.useEffect(() => {
    setPeriodIndex(getPeriodIndex(period));
  }, [period]);

  // Two-way binding between the controlled `cron` prop and the internal
  // `cronExpInput` atom. Splitting this into two opposing effects causes them
  // to swap stale values on a single commit and ping-pong forever whenever the
  // initial prop differs from the atom default (-> "Maximum update depth
  // exceeded"). A single effect that propagates only the side that actually
  // changed converges in one render.
  const prevSync = React.useRef<{ cron: string; input: string } | null>(null);
  React.useEffect(() => {
    if (prevSync.current === null) {
      // Initial mount: adopt a non-default prop, otherwise report the current
      // expression back up so the parent always receives the (normalized)
      // value at least once.
      if (cron !== cronExpInput) {
        setCronExpInput(cron);
      } else {
        setCron(cronExpInput);
      }
      prevSync.current = { cron, input: cronExpInput };
      return;
    }
    const cronChanged = cron !== prevSync.current.cron;
    const inputChanged = cronExpInput !== prevSync.current.input;
    if (cronChanged && cron !== cronExpInput) {
      // Parent pushed a new value down -> ingest it.
      setCronExpInput(cron);
    } else if (inputChanged && cronExpInput !== cron) {
      // Internal value changed (user edit / field change) -> notify parent.
      setCron(cronExpInput);
    }
    prevSync.current = { cron, input: cronExpInput };
  }, [cron, cronExpInput, setCron, setCronExpInput]);

  React.useEffect(() => {
    if (isAdmin) {
      setIsAdmin(isAdmin);
    } else {
      setIsAdmin(false);
    }
  }, [isAdmin, setIsAdmin]);

  React.useEffect(() => {
    if (customLocale) {
      setResolvedLocale(customLocale);
    } else if (locale) {
      setResolvedLocale(supportedLanguages[locale]);
    } else {
      setResolvedLocale(supportedLanguages['en']);
    }
  }, [locale, customLocale, setResolvedLocale]);

  // Re-localize the *selected* values when the locale changes. The option
  // `value`s are locale-stable ('day', 'at', '0'...) while only the `label` is
  // translated, so a stored selection keeps a stale label after a locale
  // switch (e.g. period reads "day" under Chinese). Re-map each selection onto
  // the matching option in the new locale, preserving the choice and
  // refreshing its label. Falls back to the existing value if no match.
  React.useEffect(() => {
    const remap = (opts: SelectOptions[]) => (prev: SelectOptions) =>
      opts.find((o) => o.value === prev.value) ?? prev;
    const remapList = (opts: SelectOptions[]) => (prev: SelectOptions[]) =>
      prev.map((item) => opts.find((o) => o.value === item.value) ?? item);

    setPeriod(remap(getPeriodOptions(currentLocale.periodOptions)));

    const atEvery = atEveryOptions(currentLocale.atOptionLabel, currentLocale.everyOptionLabel);
    setMinuteAtEvery(remap(atEvery));
    setHourAtEvery(remap(atEvery));
    setDayOfMonthAtEvery(
      remap(onEveryOptions(currentLocale.onOptionLabel, currentLocale.everyOptionLabel)),
    );

    setWeek(remapList(weekOptions(currentLocale.weekDaysOptions)));
    setMonth(remapList(getMonthOptions(currentLocale.shortMonthOptions)));
  }, [
    currentLocale,
    setPeriod,
    setMinuteAtEvery,
    setHourAtEvery,
    setDayOfMonthAtEvery,
    setWeek,
    setMonth,
  ]);

  const card = (
    <Root>
      <SchedulerHeader sx={slotProps?.header?.sx} title={title} />
      <Grid data-layout={layout}>
        <FormCol className='form-col'>
          <CronReader />
          <Period />
          {periodIndex > 3 && <Month />}
          {periodIndex > 2 && <DayOfMonth />}
          {periodIndex > 1 && <Week />}
          {periodIndex > 0 && <Hour />}
          <Minute />
        </FormCol>
        <SideCol>
          <NextRuns timezone={timezone} />
          {showCalendar && <RunCalendar timezone={timezone} />}
        </SideCol>
      </Grid>
    </Root>
  );

  // No accent override: render the card under the surrounding theme as-is.
  if (!accentTheme) {
    return card;
  }

  return <ThemeProvider theme={accentTheme}>{card}</ThemeProvider>;
}
