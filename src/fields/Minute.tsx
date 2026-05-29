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
  defaultMinuteOptions,
  defaultMinuteOptionsWithOrdinal,
  DEFAULT_MINUTE_OPTS,
} from '../constants';
import { localeString } from '../localization/strings';
import {
  isAdminState,
  localeState,
  minuteAtEveryState,
  minuteRangeEndSchedulerState,
  minuteRangeStartSchedulerState,
  minuteState,
} from '../store';

export default function Minute() {
  const [minuteAtEvery, setMinuteAtEvery] = useAtom(minuteAtEveryState);
  const [startMinute, setStartMinute] = useAtom(minuteRangeStartSchedulerState);
  const [endMinute, setEndMinute] = useAtom(minuteRangeEndSchedulerState);
  const [minute, setMinute] = useAtom(minuteState);
  const [minuteOptions, setMinuteOptions] = React.useState(DEFAULT_MINUTE_OPTS);

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

  // Every-mode: the interval N is the single selected minute option; the
  // stepper maps a number back onto that option (preserving the cron the old
  // single-select dropdown produced).
  const interval = Number(minute[0]?.value ?? '1');
  const setInterval = (next: number) => {
    const option = minuteOptions.find((o) => o.value === String(next)) ?? {
      value: String(next),
      label: String(next),
    };
    setMinute([option]);
  };

  return (
    <FieldRow label={resolvedLocale.minuteLabel}>
      <SegmentedControl
        ariaLabel={resolvedLocale.atEveryText}
        options={
          isAdmin
            ? atEveryOptions(resolvedLocale.atOptionLabel, resolvedLocale.everyOptionLabel)
            : atOptionsNonAdmin(resolvedLocale.atOptionLabel, resolvedLocale.everyOptionLabel)
        }
        value={minuteAtEvery}
        setValue={setMinuteAtEvery}
      />
      {minuteAtEvery.value === 'every' ? (
        <>
          <Stepper
            ariaLabel={resolvedLocale.minuteLabel}
            value={interval}
            min={1}
            max={59}
            onChange={setInterval}
            disabled={!isAdmin}
          />
          <RangePicker
            baseOptions={defaultMinuteOptionsWithOrdinal()}
            start={startMinute}
            setStart={setStartMinute}
            end={endMinute}
            setEnd={setEndMinute}
            betweenText={resolvedLocale.betweenText}
            andText={resolvedLocale.andText}
            size='sm'
            disabled={!isAdmin}
          />
        </>
      ) : (
        <ChipMultiSelect
          ariaLabel={resolvedLocale.minuteLabel}
          addLabel={localeString(resolvedLocale, 'addLabel')}
          options={minuteOptions}
          value={minute}
          onChange={setMinute}
          single={!isAdmin}
          disableEmpty
          sort
        />
      )}
    </FieldRow>
  );
}
