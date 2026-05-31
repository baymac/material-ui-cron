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
import { capIntervalOptionsToSpan, getMinutesIndex } from '../utils';

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

  // The two range selects cross-disable each other so the window stays low→high:
  // an end option is disabled if it's at or before the chosen start, and a start
  // option is disabled if it's at or after the chosen end. This is pure derived
  // state — compute it during render from the base ranges + the two current
  // selections (no useState/useEffect mirror, which would lag a render behind
  // and force omitting deps to avoid a loop).
  const baseTimes = defaultMinuteOptionsWithOrdinal();
  const startIndex = baseTimes.findIndex((x) => x.value === startMinute.value);
  const endIndex = baseTimes.findIndex((x) => x.value === endMinute.value);
  const possibleStartTimes = React.useMemo(
    () => baseTimes.map((option, index) => ({ ...option, disabled: index >= endIndex })),
    [baseTimes, endIndex],
  );
  const possibleEndTimes = React.useMemo(
    () => baseTimes.map((option, index) => ({ ...option, disabled: index <= startIndex })),
    [baseTimes, startIndex],
  );

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

  // In `every` mode the cron is `start-end/N`; the interval N must not exceed the
  // window span or the step lands outside the range and the schedule collapses to
  // a single run. Cap the selectable interval at the span (no cap in `at` mode,
  // where this same select picks the actual minutes).
  const intervalSpan =
    minuteAtEvery.value === 'every'
      ? getMinutesIndex(endMinute) - getMinutesIndex(startMinute)
      : Number.POSITIVE_INFINITY;
  const intervalOptions = React.useMemo(
    () => capIntervalOptionsToSpan(minuteOptions, intervalSpan),
    [minuteOptions, intervalSpan],
  );

  // If the range narrows below the current interval, clamp the interval down to
  // the span so the selection never sits on a now-disabled (collapsing) value.
  React.useEffect(() => {
    if (minuteAtEvery.value !== 'every' || minute.length !== 1) {
      return;
    }
    const span = getMinutesIndex(endMinute) - getMinutesIndex(startMinute);
    if (Number(minute[0].value) > span) {
      setMinute([minuteOptions[span]]);
    }
  }, [startMinute, endMinute, minuteAtEvery]);

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
        options={intervalOptions}
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
