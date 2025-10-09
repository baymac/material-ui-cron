import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import React from 'react';
import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
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
  const period = useRecoilValue(periodState);
  const [periodIndex, setPeriodIndex] = React.useState(0);

  const cronError = useRecoilValue(cronValidationErrorMessageState);
  const setIsAdmin = useSetRecoilState(isAdminState);

  const [cronExpInput, setCronExpInput] = useRecoilState(cronExpInputState);
  const setResolvedLocale = useSetRecoilState(localeState);

  const resetCronExpInput = useResetRecoilState(cronExpInputState);
  const resetMinute = useResetRecoilState(minuteState);
  const resetHour = useResetRecoilState(hourState);
  const resetDayOfMonth = useResetRecoilState(dayOfMonthState);
  const resetDayOfWeek = useResetRecoilState(weekState);
  const resetMonth = useResetRecoilState(monthState);
  const resetPeriod = useResetRecoilState(periodState);

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
      resetCronExpInput();
      resetMinute();
      resetHour();
      resetDayOfMonth();
      resetDayOfWeek();
      resetMonth();
      resetPeriod();
    };
  }, [
    resetCronExpInput,
    resetMinute,
    resetHour,
    resetDayOfMonth,
    resetDayOfWeek,
    resetMonth,
    resetPeriod,
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
