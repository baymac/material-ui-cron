import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import React from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import CronExp from './components/CronExp';
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
  dayOfMonthState,
  hourState,
  isAdminState,
  localeState,
  minuteState,
  monthState,
  periodState,
  weekState,
} from './store';
import type { SchedulerProps } from './types';
import { getPeriodIndex } from './utils';
import {
  DEFAULT_DAY_OF_MONTH_OPTS,
  DEFAULT_HOUR_OPTS_EVERY,
  DEFAULT_MINUTE_OPTS,
  getPeriodOptions,
  getMonthOptions,
  weekOptions,
} from './constants';

const StyledBox = styled(Box)({
  minHeight: 'min-content',
  '& > *': {
    marginBottom: '16px',
  },
  '& > *:last-child': {
    marginBottom: 0,
  },
});

export default function Scheduler(props: SchedulerProps) {
  const { cron, setCron, setCronError, isAdmin, locale, customLocale } = props;
  const period = useAtomValue(periodState);
  const [periodIndex, setPeriodIndex] = React.useState(0);

  const cronError = useAtomValue(cronValidationErrorMessageState);
  const setIsAdmin = useSetAtom(isAdminState);

  const [cronExpInput, setCronExpInput] = useAtom(cronExpInputState);
  const setResolvedLocale = useSetAtom(localeState);
  const currentLocale = useAtomValue(localeState);

  // Jotai does not provide reset hooks; emulate by setting initial values on unmount
  const setMinute = useSetAtom(minuteState);
  const setHour = useSetAtom(hourState);
  const setDayOfMonth = useSetAtom(dayOfMonthState);
  const setWeek = useSetAtom(weekState);
  const setMonth = useSetAtom(monthState);
  const setPeriod = useSetAtom(periodState);

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

  // Only reset atoms on unmount.
  React.useEffect(() => {
    return () => {
      setCronExpInput('0 0 * * *');
      setMinute([DEFAULT_MINUTE_OPTS[0]]);
      setHour([DEFAULT_HOUR_OPTS_EVERY[0]]);
      setDayOfMonth(DEFAULT_DAY_OF_MONTH_OPTS);
      setWeek(weekOptions(currentLocale.weekDaysOptions));
      setMonth(getMonthOptions(currentLocale.shortMonthOptions));
      setPeriod(getPeriodOptions(currentLocale.periodOptions)[1]);
    };
  }, [
    setCronExpInput,
    setMinute,
    setHour,
    setDayOfMonth,
    setWeek,
    setMonth,
    setPeriod,
    currentLocale,
  ]);

  React.useEffect(() => {
    if (customLocale) {
      setResolvedLocale(customLocale);
    } else if (locale) {
      setResolvedLocale(supportedLanguages[locale]);
    } else {
      setResolvedLocale(supportedLanguages['en']);
    }
  }, [locale, customLocale, setResolvedLocale]);

  return (
    <>
      <StyledBox display='flex' flexDirection='column'>
        <Period />
        {periodIndex > 3 && <Month />}
        {periodIndex > 2 && <DayOfMonth />}
        {periodIndex > 1 && <Week />}
        {periodIndex > 0 && <Hour />}
        <Minute />
        <CronExp />
        <CronReader />
      </StyledBox>
    </>
  );
}
