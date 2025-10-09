import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import CustomSelect from '../components/CustomSelect';
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

const StyledAtEveryTypography = styled(Typography)({
  textAlign: 'left',
});

const StyledRightControls = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
});

export default function Hour() {
  const [hourAtEvery, setHourAtEvery] = useRecoilState(hourAtEveryState);
  const [startHour, setStartHour] = useRecoilState(hourRangeStartSchedulerState);
  const [endHour, setEndHour] = useRecoilState(hourRangeEndSchedulerState);
  const [hour, setHour] = useRecoilState(hourState);
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

  const isAdmin = useRecoilValue(isAdminState);

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

  const resolvedLocale = useRecoilValue(localeState);

  return (
    <StyledGridContainer>
      <CustomSelect
        size='sm'
        single
        options={
          isAdmin
            ? atEveryOptions(resolvedLocale.atOptionLabel, resolvedLocale.everyOptionLabel)
            : atOptionsNonAdmin(resolvedLocale.atOptionLabel, resolvedLocale.everyOptionLabel)
        }
        label={resolvedLocale.atEveryText}
        value={hourAtEvery}
        setValue={setHourAtEvery}
        multiple={false}
        disableClearable
      />
      <StyledRightControls>
        <CustomSelect
          size='lg'
          options={hourOptions}
          label={resolvedLocale.hourLabel}
          value={hour}
          setValue={setHour}
          single={hourAtEvery.value === 'every' || !isAdmin}
          sort
          disableEmpty
          limitTags={3}
          disableClearable={hourAtEvery.value === 'every' || hour.length < 2}
          disabled={!isAdmin && hourAtEvery.value === 'every'}
        />
        {hourAtEvery.value === 'every' && (
          <>
            <StyledBetweenTypography>{resolvedLocale.betweenText}</StyledBetweenTypography>
            <CustomSelect
              size='md'
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
              size='md'
              single
              options={possibleEndTimes}
              label={''}
              value={endHour}
              setValue={setEndHour}
              multiple={false}
              disableClearable
              disabled={!isAdmin}
            />
          </>
        )}
      </StyledRightControls>
    </StyledGridContainer>
  );
}
