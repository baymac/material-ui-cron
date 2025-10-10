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

  React.useEffect(() => {
    setCron(cronExpInput);
  }, [cronExpInput, setCron]);

  React.useEffect(() => {
    if (isAdmin) {
      setIsAdmin(isAdmin);
    } else {
      setIsAdmin(false);
    }
  }, [isAdmin, setIsAdmin]);

  React.useEffect(() => {
    setCronExpInput(cron);
  }, [cron, setCronExpInput]);

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
