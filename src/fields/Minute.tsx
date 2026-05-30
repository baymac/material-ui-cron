import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React from 'react';
import { useAtom, useAtomValue } from 'jotai';
import CustomSelect from '../components/CustomSelect';
import FieldRow from '../components/FieldRow';
import RangeGroup, { RangePair } from '../components/RangeGroup';
import SegmentedControl from '../components/SegmentedControl';
import {
  atEveryOptions,
  atOptionsNonAdmin,
  defaultMinuteOptions,
  defaultMinuteOptionsWithOrdinal,
  DEFAULT_MINUTE_OPTS,
} from '../constants';
import {
  isAdminState,
  localeState,
  minuteAtEveryState,
  minuteRangeEndSchedulerState,
  minuteRangeStartSchedulerState,
  minuteState,
} from '../store';

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

export default function Minute() {
  const [minuteAtEvery, setMinuteAtEvery] = useAtom(minuteAtEveryState);
  const [startMinute, setStartMinute] = useAtom(minuteRangeStartSchedulerState);
  const [endMinute, setEndMinute] = useAtom(minuteRangeEndSchedulerState);
  const [minute, setMinute] = useAtom(minuteState);
  const [minuteOptions, setMinuteOptions] = React.useState(DEFAULT_MINUTE_OPTS);

  const [possibleStartTimes, setPossibleStartTimes] = React.useState(
    defaultMinuteOptionsWithOrdinal(),
  );

  const [possibleEndTimes, setPossibleEndTimes] = React.useState(defaultMinuteOptionsWithOrdinal());

  React.useEffect(() => {
    const startIndex = possibleStartTimes.findIndex((x) => x.value === startMinute.value);
    const limitedPossibleTimeRange = possibleEndTimes.map((possibleEndTime, index) => ({
      ...possibleEndTime,
      disabled: index <= startIndex,
    }));
    setPossibleEndTimes(limitedPossibleTimeRange);
  }, [startMinute]);

  React.useEffect(() => {
    const endIndex = possibleEndTimes.findIndex((x) => x.value === endMinute.value);
    const limitedPossibleTimeRange = possibleStartTimes.map((possibleStartTime, index) => ({
      ...possibleStartTime,
      disabled: index >= endIndex,
    }));
    setPossibleStartTimes(limitedPossibleTimeRange);
  }, [endMinute]);

  const isAdmin = useAtomValue(isAdminState);

  React.useEffect(() => {
    if (minuteAtEvery.value === 'every') {
      if (minute.length > 1) {
        setMinute([minuteOptions[1]]);
      } else if (minute[0].value === '0') {
        setMinute([minuteOptions[1]]);
      }
      setMinuteOptions((prevMinuteOptions) =>
        prevMinuteOptions.map((prevMinuteOption) => ({
          ...prevMinuteOption,
          ...(prevMinuteOption.value === '0' && { disabled: true }),
        })),
      );
    } else {
      setMinuteOptions(defaultMinuteOptions);
    }
  }, [minuteAtEvery, isAdmin]);

  React.useEffect(() => {
    if (!isAdmin && minute.length > 1) {
      setMinute((prevMinute) => [prevMinute[0]]);
    }
  }, [isAdmin]);

  const resolvedLocale = useAtomValue(localeState);

  // Switch the value to a valid non-zero interval in the SAME update as the
  // mode toggle. Otherwise the derived cron briefly becomes `*/0` (interval 0)
  // between the mode change and the effect that fixes the value, flashing an
  // "Invalid minute cron part" error before it self-corrects.
  const handleAtEvery = (next: typeof minuteAtEvery) => {
    if (next.value === 'every' && (minute.length !== 1 || minute[0].value === '0')) {
      setMinute([DEFAULT_MINUTE_OPTS[1]]);
    }
    setMinuteAtEvery(next);
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
          value={minuteAtEvery}
          setValue={handleAtEvery}
        />
      }
    >
      <CustomSelect
        size={minuteAtEvery.value === 'every' || !isAdmin ? 'sm' : 'lg'}
        options={minuteOptions}
        label={resolvedLocale.minuteLabel}
        value={minute}
        setValue={setMinute}
        disableClearable={minuteAtEvery.value === 'every' || minute.length < 2}
        single={minuteAtEvery.value === 'every' || !isAdmin}
        sort
        disableEmpty
        disabled={minuteAtEvery.value === 'every' && !isAdmin}
      />
      {minuteAtEvery.value === 'every' && (
        <RangeGroup>
          <StyledBetweenTypography>{resolvedLocale.betweenText}</StyledBetweenTypography>
          <RangePair>
            <CustomSelect
              size='sm'
              single
              options={possibleStartTimes}
              label={''}
              value={startMinute}
              setValue={setStartMinute}
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
              value={endMinute}
              setValue={setEndMinute}
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
