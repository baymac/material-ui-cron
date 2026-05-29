import { useAtom, useAtomValue } from 'jotai';
import React from 'react';
import ChipMultiSelect from '../components/ChipMultiSelect';
import FieldRow from '../components/FieldRow';
import RangePicker from '../components/RangePicker';
import SegmentedControl from '../components/SegmentedControl';
import Stepper from '../components/Stepper';
import {
  atEveryOptions,
  atOptionsNonAdmin,
  DEFAULT_HOUR_OPTS_AT,
  DEFAULT_HOUR_OPTS_EVERY,
  defaultHourOptions,
} from '../constants';
import { localeString } from '../localization/strings';
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

export default function Hour() {
  const [hourAtEvery, setHourAtEvery] = useAtom(hourAtEveryState);
  const [startHour, setStartHour] = useAtom(hourRangeStartSchedulerState);
  const [endHour, setEndHour] = useAtom(hourRangeEndSchedulerState);
  const [hour, setHour] = useAtom(hourState);
  const [hourOptions, setHourOptions] = React.useState(defaultHourOptions);

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

  // Every-mode: the interval N is the single selected hour option.
  const interval = Number(hour[0]?.value ?? '1');
  const setInterval = (next: number) => {
    const option = hourOptions.find((o) => o.value === String(next)) ?? {
      value: String(next),
      label: String(next),
    };
    setHour([option]);
  };

  return (
    <FieldRow label={resolvedLocale.hourLabel}>
      <SegmentedControl
        ariaLabel={resolvedLocale.atEveryText}
        options={
          isAdmin
            ? atEveryOptions(resolvedLocale.atOptionLabel, resolvedLocale.everyOptionLabel)
            : atOptionsNonAdmin(resolvedLocale.atOptionLabel, resolvedLocale.everyOptionLabel)
        }
        value={hourAtEvery}
        setValue={setHourAtEvery}
      />
      {hourAtEvery.value === 'every' ? (
        <>
          <Stepper
            ariaLabel={resolvedLocale.hourLabel}
            value={interval}
            min={1}
            max={23}
            onChange={setInterval}
            disabled={!isAdmin}
          />
          <RangePicker
            baseOptions={POSSIBLE_TIME_RANGES}
            start={startHour}
            setStart={setStartHour}
            end={endHour}
            setEnd={setEndHour}
            betweenText={resolvedLocale.betweenText}
            andText={resolvedLocale.andText}
            size='md'
            disabled={!isAdmin}
          />
        </>
      ) : (
        <ChipMultiSelect
          ariaLabel={resolvedLocale.hourLabel}
          addLabel={localeString(resolvedLocale, 'addLabel')}
          options={hourOptions}
          value={hour}
          onChange={setHour}
          single={!isAdmin}
          disableEmpty
          sort
        />
      )}
    </FieldRow>
  );
}
