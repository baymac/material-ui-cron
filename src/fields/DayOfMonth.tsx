import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React from 'react';
import { useAtom, useAtomValue } from 'jotai';
import CustomSelect from '../components/CustomSelect';
import {
  DEFAULT_DAY_OF_MONTH_OPTS,
  DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD,
  getDayOfMonthsOptionsWithL,
  getLastDayOfMonthOption,
  onEveryOptions,
} from '../constants';
import {
  dayOfMonthAtEveryState,
  dayOfMonthRangeEndSchedulerState,
  dayOfMonthRangeStartSchedulerState,
  dayOfMonthState,
  localeState,
} from '../store';
import type { SelectOptions } from '../types';
import { getIndex } from '../utils';

const StyledBetweenTypography = styled(Typography)({
  margin: '0 6px',
  display: 'flex',
  alignItems: 'center',
  height: '40px', // Match the height of CustomSelect components
});

const StyledGridContainer = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '100px 1fr',
  gap: '16px',
  alignItems: 'center',
  padding: '8px 16px',
  margin: '8px 16px',
});

const StyledOnEveryTypography = styled(Typography)({
  textAlign: 'left',
});

const StyledRightControls = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
});

export default function DayOfMonth() {
  const resolvedLocale = useAtomValue(localeState);

  const [dayOfMonthAtEvery, setDayOfMonthAtEvery] = useAtom(dayOfMonthAtEveryState);
  const [startMonth, setStartMonth] = useAtom(dayOfMonthRangeStartSchedulerState);
  const [endMonth, setEndMonth] = useAtom(dayOfMonthRangeEndSchedulerState);
  const [dayOfMonth, setDayOfMonth] = useAtom(dayOfMonthState);
  const [dayOfMonthOptions, setDayOfMonthOptions] = React.useState(
    getDayOfMonthsOptionsWithL(resolvedLocale.lastDayOfMonthLabel),
  );

  const [possibleStartDays, setPossibleStartDays] = React.useState(
    DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD,
  );

  const [possibleEndDays, setPossibleEndDays] = React.useState(DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD);

  React.useEffect(() => {
    const startIndex = possibleStartDays.findIndex((x) => x.value === startMonth.value);
    const limitedPossibleTimeRange = possibleEndDays.map((possibleEndTime, index) => ({
      ...possibleEndTime,
      disabled: index <= startIndex,
    }));
    setPossibleEndDays(limitedPossibleTimeRange);
  }, [startMonth]);

  React.useEffect(() => {
    const endIndex = possibleEndDays.findIndex((x) => x.value === endMonth.value);
    const limitedPossibleTimeRange = possibleStartDays.map((possibleStartTime, index) => ({
      ...possibleStartTime,
      disabled: index >= endIndex,
    }));
    setPossibleStartDays(limitedPossibleTimeRange);
  }, [endMonth]);

  React.useEffect(() => {
    if (dayOfMonthAtEvery.value === 'every') {
      if (dayOfMonth.length > 1) {
        setDayOfMonth([DEFAULT_DAY_OF_MONTH_OPTS[0]]);
      } else if (dayOfMonth[0].value === 'L') {
        setDayOfMonth([DEFAULT_DAY_OF_MONTH_OPTS[0]]);
      }
      setDayOfMonthOptions(DEFAULT_DAY_OF_MONTH_OPTS);
    } else {
      setDayOfMonthOptions(getDayOfMonthsOptionsWithL(resolvedLocale.lastDayOfMonthLabel));
    }
  }, [dayOfMonthAtEvery]);

  const handleChange = (newOptions: SelectOptions[]) => {
    if (dayOfMonthAtEvery.value === 'on') {
      if (getIndex(getLastDayOfMonthOption(resolvedLocale.lastDayOfMonthLabel), newOptions) === 0) {
        setDayOfMonth(newOptions.filter((option) => option.value !== 'L'));
      } else if (
        getIndex(getLastDayOfMonthOption(resolvedLocale.lastDayOfMonthLabel), newOptions) > 0
      ) {
        setDayOfMonth([getLastDayOfMonthOption(resolvedLocale.lastDayOfMonthLabel)]);
      } else {
        setDayOfMonth(newOptions);
      }
    } else {
      setDayOfMonth(newOptions);
    }
  };

  return (
    <StyledGridContainer>
      <CustomSelect
        size='sm'
        single
        options={onEveryOptions(resolvedLocale.onOptionLabel, resolvedLocale.everyOptionLabel)}
        label={resolvedLocale.onEveryText}
        value={dayOfMonthAtEvery}
        setValue={setDayOfMonthAtEvery}
        multiple={false}
        disableClearable
      />
      <StyledRightControls>
        <CustomSelect
          size='lg'
          options={dayOfMonthOptions}
          label={
            dayOfMonthAtEvery.value === 'on'
              ? resolvedLocale.multiDayOfMonthLabel
              : resolvedLocale.dayOfMonthLabel
          }
          value={dayOfMonth}
          setValue={handleChange}
          single={dayOfMonthAtEvery.value === 'every'}
          sort
          disableEmpty
          limitTags={3}
          disableClearable={dayOfMonthAtEvery.value === 'every' || dayOfMonth.length < 2}
        />
        {dayOfMonthAtEvery.value === 'every' && (
          <>
            <StyledBetweenTypography>{resolvedLocale.betweenText}</StyledBetweenTypography>
            <CustomSelect
              size='md'
              single
              options={possibleStartDays}
              label={''}
              value={startMonth}
              setValue={setStartMonth}
              multiple={false}
              disableClearable
            />
            <StyledBetweenTypography>{resolvedLocale.andText}</StyledBetweenTypography>
            <CustomSelect
              size='md'
              single
              options={possibleEndDays}
              label={''}
              value={endMonth}
              setValue={setEndMonth}
              multiple={false}
              disableClearable
            />
          </>
        )}
      </StyledRightControls>
    </StyledGridContainer>
  );
}
