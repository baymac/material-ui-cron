import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useAtom, useAtomValue } from 'jotai';
import CustomSelect from '../components/CustomSelect';
import FieldRow from '../components/FieldRow';
import RangeGroup, { RangePair } from '../components/RangeGroup';
import SegmentedControl from '../components/SegmentedControl';
import {
  atEveryOptions,
  atOptionsNonAdmin,
  DEFAULT_HOUR_OPTS_AT,
  DEFAULT_HOUR_OPTS_EVERY,
  defaultHourOptions,
} from '../constants';
import {
  hourAtEveryState,
  hourRangeEndSchedulerState,
  hourRangeStartSchedulerState,
  hourState,
  isAdminState,
  localeState,
} from '../store';
import { getTimesOfTheDay } from '../utils';

const POSSIBLE_TIME_RANGES = getTimesOfTheDay();

const StyledBetweenTypography = styled(Typography)({
  margin: '0 2px',
  display: 'flex',
  alignItems: 'center',
  height: '40px', // Match the height of CustomSelect components
});

export default function Hour() {
  const [hourAtEvery, setHourAtEvery] = useAtom(hourAtEveryState);
  const [startHour, setStartHour] = useAtom(hourRangeStartSchedulerState);
  const [endHour, setEndHour] = useAtom(hourRangeEndSchedulerState);
  const [hour, setHour] = useAtom(hourState);
  const [hourOptions, setHourOptions] = React.useState(defaultHourOptions);

  const [possibleStartTimes, setPossibleStartTimes] = React.useState(POSSIBLE_TIME_RANGES);

  const [possibleEndTimes, setPossibleEndTimes] = React.useState(POSSIBLE_TIME_RANGES);

  React.useEffect(() => {
    const startIndex = possibleStartTimes.findIndex((x) => x.value === startHour.value);
    const limitedPossibleTimeRange = possibleEndTimes.map((possibleEndTime, index) => ({
      ...possibleEndTime,
      disabled: index <= startIndex,
    }));
    setPossibleEndTimes(limitedPossibleTimeRange);
  }, [startHour]);

  React.useEffect(() => {
    const endIndex = possibleEndTimes.findIndex((x) => x.value === endHour.value);
    const limitedPossibleTimeRange = possibleStartTimes.map((possibleStartTime, index) => ({
      ...possibleStartTime,
      disabled: index >= endIndex,
    }));
    setPossibleStartTimes(limitedPossibleTimeRange);
  }, [endHour]);

  const isAdmin = useAtomValue(isAdminState);

  React.useEffect(() => {
    if (hourAtEvery.value === 'every') {
      if (hour.length > 1) {
        setHour([hourOptions[1]]);
      } else if (hour[0].value === '0') {
        setHour([hourOptions[1]]);
      }
      setHourOptions(DEFAULT_HOUR_OPTS_EVERY);
    } else {
      setHourOptions(DEFAULT_HOUR_OPTS_AT);
    }
  }, [hourAtEvery, isAdmin]);

  React.useEffect(() => {
    if (!isAdmin && hour.length > 1) {
      setHour((prevHour) => [prevHour[0]]);
    }
  }, [isAdmin]);

  const resolvedLocale = useAtomValue(localeState);

  // Set a valid non-zero interval in the SAME update as the mode toggle so the
  // derived cron never briefly becomes `*/0` (which flashes an invalid-cron
  // error before the effect corrects the value).
  const handleAtEvery = (next: typeof hourAtEvery) => {
    if (next.value === 'every' && (hour.length !== 1 || hour[0].value === '0')) {
      setHour([DEFAULT_HOUR_OPTS_AT[1]]);
    }
    setHourAtEvery(next);
  };

  return (
    <FieldRow
      headerSlot={
        <SegmentedControl
          ariaLabel={resolvedLocale.atEveryText}
          options={
            isAdmin
              ? atEveryOptions(resolvedLocale.atOptionLabel, resolvedLocale.everyOptionLabel)
              : atOptionsNonAdmin(resolvedLocale.atOptionLabel, resolvedLocale.everyOptionLabel)
          }
          value={hourAtEvery}
          setValue={handleAtEvery}
        />
      }
    >
      <CustomSelect
        size={hourAtEvery.value === 'every' || !isAdmin ? 'sm' : 'lg'}
        options={hourOptions}
        label={resolvedLocale.hourLabel}
        value={hour}
        setValue={setHour}
        single={hourAtEvery.value === 'every' || !isAdmin}
        sort
        disableEmpty
        disableClearable={hourAtEvery.value === 'every' || hour.length < 2}
        disabled={!isAdmin && hourAtEvery.value === 'every'}
      />
      {hourAtEvery.value === 'every' && (
        <RangeGroup>
          <StyledBetweenTypography>{resolvedLocale.betweenText}</StyledBetweenTypography>
          <RangePair>
            <CustomSelect
              size='sm'
              single
              options={possibleStartTimes}
              label={''}
              value={startHour}
              setValue={setStartHour}
              multiple={false}
              disableClearable
              disabled={!isAdmin}
            />
            <StyledBetweenTypography>{resolvedLocale.andText}</StyledBetweenTypography>
            <CustomSelect
              size='sm'
              single
              options={possibleEndTimes}
              label={''}
              value={endHour}
              setValue={setEndHour}
              multiple={false}
              disableClearable
              disabled={!isAdmin}
            />
          </RangePair>
        </RangeGroup>
      )}
    </FieldRow>
  );
}
