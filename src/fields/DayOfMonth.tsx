import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React from 'react';
import { useAtom, useAtomValue } from 'jotai';
import CustomSelect from '../components/CustomSelect';
import FieldRow from '../components/FieldRow';
import RangeGroup, { RangePair } from '../components/RangeGroup';
import SegmentedControl from '../components/SegmentedControl';
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
import { capIntervalOptionsToSpan, getIndex } from '../utils';

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

export default function DayOfMonth() {
  const resolvedLocale = useAtomValue(localeState);

  const [dayOfMonthAtEvery, setDayOfMonthAtEvery] = useAtom(dayOfMonthAtEveryState);
  const [startMonth, setStartMonth] = useAtom(dayOfMonthRangeStartSchedulerState);
  const [endMonth, setEndMonth] = useAtom(dayOfMonthRangeEndSchedulerState);
  const [dayOfMonth, setDayOfMonth] = useAtom(dayOfMonthState);
  const [dayOfMonthOptions, setDayOfMonthOptions] = React.useState(() =>
    getDayOfMonthsOptionsWithL(resolvedLocale.lastDayOfMonthLabel),
  );

  // The two range selects cross-disable each other so the window stays low→high:
  // an end option is disabled if it's at or before the chosen start, and a start
  // option is disabled if it's at or after the chosen end. This is pure derived
  // state — compute it during render from the base options + the two current
  // selections (no useState/useEffect mirror, which would lag a render behind
  // and force omitting deps to avoid a loop).
  const startIndex = DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD.findIndex(
    (x) => x.value === startMonth.value,
  );
  const endIndex = DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD.findIndex((x) => x.value === endMonth.value);
  const possibleStartDays = React.useMemo(
    () =>
      DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD.map((option, index) => ({
        ...option,
        disabled: index >= endIndex,
      })),
    [endIndex],
  );
  const possibleEndDays = React.useMemo(
    () =>
      DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD.map((option, index) => ({
        ...option,
        disabled: index <= startIndex,
      })),
    [startIndex],
  );

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

  // Set a valid single day in the SAME update as the mode toggle so the derived
  // cron never briefly becomes `*/L` (invalid interval) when switching to
  // "every" while "L" / multiple days are selected.
  const handleOnEvery = (next: typeof dayOfMonthAtEvery) => {
    if (next.value === 'every' && (dayOfMonth.length > 1 || dayOfMonth[0].value === 'L')) {
      setDayOfMonth([DEFAULT_DAY_OF_MONTH_OPTS[0]]);
    }
    setDayOfMonthAtEvery(next);
  };

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

  // In `every` mode the cron is `start-end/N`; the interval N must not exceed the
  // window span or the step lands outside the range and the schedule collapses to
  // a single run. Cap the selectable interval at the span (no cap in `on` mode,
  // where this same select picks the actual days).
  const intervalSpan =
    dayOfMonthAtEvery.value === 'every'
      ? Number(endMonth.value) - Number(startMonth.value)
      : Number.POSITIVE_INFINITY;
  const intervalOptions = React.useMemo(
    () => capIntervalOptionsToSpan(dayOfMonthOptions, intervalSpan),
    [dayOfMonthOptions, intervalSpan],
  );

  // If the range narrows below the current interval, clamp the interval down to
  // the span so the selection never sits on a now-disabled (collapsing) value.
  React.useEffect(() => {
    if (dayOfMonthAtEvery.value !== 'every' || dayOfMonth.length !== 1) {
      return;
    }
    const span = Number(endMonth.value) - Number(startMonth.value);
    if (Number(dayOfMonth[0].value) > span) {
      setDayOfMonth([DEFAULT_DAY_OF_MONTH_OPTS[span - 1]]);
    }
  }, [startMonth, endMonth, dayOfMonthAtEvery]);

  return (
    <FieldRow
      headerSlot={
        <SegmentedControl
          ariaLabel={resolvedLocale.onEveryText}
          options={onEveryOptions(resolvedLocale.onOptionLabel, resolvedLocale.everyOptionLabel)}
          value={dayOfMonthAtEvery}
          setValue={handleOnEvery}
        />
      }
    >
      <CustomSelect
        size={dayOfMonthAtEvery.value === 'every' ? 'sm' : 'lg'}
        options={intervalOptions}
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
        disableClearable={dayOfMonthAtEvery.value === 'every' || dayOfMonth.length < 2}
      />
      {dayOfMonthAtEvery.value === 'every' && (
        <RangeGroup>
          <StyledBetweenTypography>{resolvedLocale.betweenText}</StyledBetweenTypography>
          <RangePair>
            <CustomSelect
              size='sm'
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
              size='sm'
              single
              options={possibleEndDays}
              label={''}
              value={endMonth}
              setValue={setEndMonth}
              multiple={false}
              disableClearable
            />
          </RangePair>
        </RangeGroup>
      )}
    </FieldRow>
  );
}
