import { useAtom, useAtomValue } from 'jotai';
import React from 'react';
import ChipMultiSelect from '../components/ChipMultiSelect';
import FieldRow from '../components/FieldRow';
import RangePicker from '../components/RangePicker';
import SegmentedControl from '../components/SegmentedControl';
import Stepper from '../components/Stepper';
import {
  DEFAULT_DAY_OF_MONTH_OPTS,
  DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD,
  getDayOfMonthsOptionsWithL,
  getLastDayOfMonthOption,
  onEveryOptions,
} from '../constants';
import { localeString } from '../localization/strings';
import {
  dayOfMonthAtEveryState,
  dayOfMonthRangeEndSchedulerState,
  dayOfMonthRangeStartSchedulerState,
  dayOfMonthState,
  localeState,
} from '../store';
import type { SelectOptions } from '../types';
import { getIndex } from '../utils';

export default function DayOfMonth() {
  const resolvedLocale = useAtomValue(localeState);

  const [dayOfMonthAtEvery, setDayOfMonthAtEvery] = useAtom(dayOfMonthAtEveryState);
  const [startMonth, setStartMonth] = useAtom(dayOfMonthRangeStartSchedulerState);
  const [endMonth, setEndMonth] = useAtom(dayOfMonthRangeEndSchedulerState);
  const [dayOfMonth, setDayOfMonth] = useAtom(dayOfMonthState);
  const [dayOfMonthOptions, setDayOfMonthOptions] = React.useState(
    getDayOfMonthsOptionsWithL(resolvedLocale.lastDayOfMonthLabel),
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

  // Every-mode: the interval N is the single selected day option.
  const interval = Number(dayOfMonth[0]?.value ?? '1');
  const setInterval = (next: number) => {
    const option = DEFAULT_DAY_OF_MONTH_OPTS.find((o) => o.value === String(next)) ?? {
      value: String(next),
      label: String(next),
    };
    setDayOfMonth([option]);
  };

  return (
    <FieldRow
      label={
        dayOfMonthAtEvery.value === 'on'
          ? resolvedLocale.multiDayOfMonthLabel
          : resolvedLocale.dayOfMonthLabel
      }
    >
      <SegmentedControl
        ariaLabel={resolvedLocale.onEveryText}
        options={onEveryOptions(resolvedLocale.onOptionLabel, resolvedLocale.everyOptionLabel)}
        value={dayOfMonthAtEvery}
        setValue={setDayOfMonthAtEvery}
      />
      {dayOfMonthAtEvery.value === 'every' ? (
        <>
          <Stepper
            ariaLabel={resolvedLocale.dayOfMonthLabel}
            value={interval}
            min={1}
            max={31}
            onChange={setInterval}
          />
          <RangePicker
            baseOptions={DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD}
            start={startMonth}
            setStart={setStartMonth}
            end={endMonth}
            setEnd={setEndMonth}
            betweenText={resolvedLocale.betweenText}
            andText={resolvedLocale.andText}
            size='md'
          />
        </>
      ) : (
        <ChipMultiSelect
          ariaLabel={resolvedLocale.multiDayOfMonthLabel}
          addLabel={localeString(resolvedLocale, 'addLabel')}
          options={dayOfMonthOptions}
          value={dayOfMonth}
          onChange={handleChange}
          disableEmpty
          sort
        />
      )}
    </FieldRow>
  );
}
