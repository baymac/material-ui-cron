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
import { capIntervalOptionsToSpan, getTimeIndex, getTimesOfTheDay } from '../utils';

const POSSIBLE_TIME_RANGES = getTimesOfTheDay();

const StyledBetweenTypography = styled(Typography)({
  margin: '0 2px',
  // No fixed height: the parent's alignItems centers it against the inline
  // selects. lineHeight 1 keeps the flex item the same height as the glyph so,
  // when it wraps onto its own mobile line, it doesn't inject extra space above
  // and below the word — keeping the gaps around "between" equal to the toggle
  // -> select gap.
  display: 'flex',
  alignItems: 'center',
  lineHeight: 1,
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

  // In `every` mode the cron is `start-end/N`; the interval N must not exceed the
  // window span or the step lands outside the range and the schedule collapses to
  // a single run. Cap the selectable interval at the span (no cap in `at` mode,
  // where this same select picks the actual hours).
  const intervalSpan =
    hourAtEvery.value === 'every'
      ? getTimeIndex(endHour) - getTimeIndex(startHour)
      : Number.POSITIVE_INFINITY;
  const intervalOptions = React.useMemo(
    () => capIntervalOptionsToSpan(hourOptions, intervalSpan),
    [hourOptions, intervalSpan],
  );

  // If the range narrows below the current interval, clamp the interval down to
  // the span so the selection never sits on a now-disabled (collapsing) value.
  React.useEffect(() => {
    if (hourAtEvery.value !== 'every' || hour.length !== 1) {
      return;
    }
    const span = getTimeIndex(endHour) - getTimeIndex(startHour);
    if (Number(hour[0].value) > span) {
      setHour([hourOptions[span]]);
    }
  }, [startHour, endHour, hourAtEvery]);

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
        options={intervalOptions}
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
