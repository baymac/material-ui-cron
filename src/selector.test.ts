import { createStore } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_DAY_OF_MONTH_OPTS,
  DEFAULT_HOUR_OPTS_EVERY,
  DEFAULT_MINUTE_OPTS,
  getPeriodOptions,
} from './constants';
import {
  cronExpState,
  dayOfMonthCronState,
  dayOfWeekCronState,
  hourCronState,
  minuteCronState,
  monthCronState,
} from './selector';
import {
  dayOfMonthState,
  hourState,
  minuteAtEveryState,
  minuteRangeEndSchedulerState,
  minuteRangeStartSchedulerState,
  minuteState,
  monthState,
  periodState,
  weekState,
} from './store';
import type { SelectOptions } from './types';

type Store = ReturnType<typeof createStore>;
let store: Store;

const en = ['hour', 'day', 'week', 'month', 'year'];
const period = (value: string): SelectOptions => getPeriodOptions(en)[en.indexOf(value)];

beforeEach(() => {
  store = createStore();
});

describe('minuteCronState', () => {
  it('is `*` when every minute is selected', () => {
    store.set(minuteState, DEFAULT_MINUTE_OPTS);
    expect(store.get(minuteCronState)).toBe('*');
  });

  it('emits a single minute', () => {
    store.set(minuteState, [DEFAULT_MINUTE_OPTS[5]]);
    expect(store.get(minuteCronState)).toBe('5');
  });

  it('emits a comma list for a non-contiguous selection', () => {
    store.set(minuteState, [DEFAULT_MINUTE_OPTS[1], DEFAULT_MINUTE_OPTS[5]]);
    expect(store.get(minuteCronState)).toBe('1,5');
  });

  it('emits a hyphen range for a contiguous selection', () => {
    store.set(minuteState, [
      DEFAULT_MINUTE_OPTS[1],
      DEFAULT_MINUTE_OPTS[2],
      DEFAULT_MINUTE_OPTS[3],
    ]);
    expect(store.get(minuteCronState)).toBe('1-3');
  });
});

describe('minuteCronState (every / step)', () => {
  const every: SelectOptions = { value: 'every', label: 'every' };

  it('emits `*/n` when the range spans the whole hour', () => {
    store.set(minuteAtEveryState, every);
    store.set(minuteRangeStartSchedulerState, { value: '0', label: '0' });
    store.set(minuteRangeEndSchedulerState, { value: '59', label: '59' });
    store.set(minuteState, [DEFAULT_MINUTE_OPTS[5]]);
    expect(store.get(minuteCronState)).toBe('*/5');
  });

  it('emits `start-end/n` for a partial range', () => {
    store.set(minuteAtEveryState, every);
    store.set(minuteRangeStartSchedulerState, { value: '0', label: '0' });
    store.set(minuteRangeEndSchedulerState, { value: '10', label: '10' });
    store.set(minuteState, [DEFAULT_MINUTE_OPTS[5]]);
    expect(store.get(minuteCronState)).toBe('0-10/5');
  });
});

describe('dayOfMonthCronState (ranges, lists, last day)', () => {
  it('emits a hyphen range', () => {
    store.set(periodState, period('month'));
    store.set(
      dayOfMonthState,
      [1, 2, 3].map((d) => ({ value: String(d), label: String(d) })),
    );
    expect(store.get(dayOfMonthCronState)).toBe('1-3');
  });

  it('emits a comma list', () => {
    store.set(periodState, period('month'));
    store.set(
      dayOfMonthState,
      [1, 5, 9].map((d) => ({ value: String(d), label: String(d) })),
    );
    expect(store.get(dayOfMonthCronState)).toBe('1,5,9');
  });

  it('emits L for the last day of month', () => {
    store.set(periodState, period('month'));
    store.set(dayOfMonthState, [{ value: 'L', label: 'Last day of month' }]);
    expect(store.get(dayOfMonthCronState)).toBe('L');
  });
});

describe('monthCronState (year period)', () => {
  it('emits a hyphen range', () => {
    store.set(periodState, period('year'));
    store.set(
      monthState,
      [1, 2, 3].map((m) => ({ value: String(m), label: String(m) })),
    );
    expect(store.get(monthCronState)).toBe('1-3');
  });

  it('emits a comma list', () => {
    store.set(periodState, period('year'));
    store.set(
      monthState,
      [1, 6, 12].map((m) => ({ value: String(m), label: String(m) })),
    );
    expect(store.get(monthCronState)).toBe('1,6,12');
  });
});

describe('dayOfWeekCronState (ranges and lists)', () => {
  it('emits a hyphen range', () => {
    store.set(periodState, period('week'));
    store.set(
      weekState,
      [1, 2, 3, 4, 5].map((d) => ({ value: String(d), label: String(d) })),
    );
    expect(store.get(dayOfWeekCronState)).toBe('1-5');
  });

  it('emits a comma list', () => {
    store.set(periodState, period('week'));
    store.set(
      weekState,
      [1, 3, 5].map((d) => ({ value: String(d), label: String(d) })),
    );
    expect(store.get(dayOfWeekCronState)).toBe('1,3,5');
  });
});

describe('hourCronState', () => {
  it('is `*` when the period is narrower than a day', () => {
    store.set(periodState, period('hour'));
    expect(store.get(hourCronState)).toBe('*');
  });

  it('emits a single hour at day period', () => {
    store.set(periodState, period('day'));
    store.set(hourState, [DEFAULT_HOUR_OPTS_EVERY[9]]);
    expect(store.get(hourCronState)).toBe('9');
  });
});

describe('dayOfMonthCronState', () => {
  it('is `*` until the period reaches month', () => {
    store.set(periodState, period('week'));
    expect(store.get(dayOfMonthCronState)).toBe('*');
  });

  it('emits a single day at month period', () => {
    store.set(periodState, period('month'));
    store.set(dayOfMonthState, [DEFAULT_DAY_OF_MONTH_OPTS[4]]); // 5th
    expect(store.get(dayOfMonthCronState)).toBe('5');
  });
});

describe('monthCronState', () => {
  it('is `*` below the year period', () => {
    store.set(periodState, period('month'));
    expect(store.get(monthCronState)).toBe('*');
  });
});

describe('dayOfWeekCronState', () => {
  it('is `*` below the week period', () => {
    store.set(periodState, period('day'));
    expect(store.get(dayOfWeekCronState)).toBe('*');
  });

  it('emits a single weekday at week period', () => {
    store.set(periodState, period('week'));
    store.set(weekState, [{ value: '1', label: 'Monday' }]);
    expect(store.get(dayOfWeekCronState)).toBe('1');
  });
});

describe('cronExpState (read getter composition)', () => {
  it('joins the five derived parts', () => {
    expect(store.get(cronExpState)).toBe('0 0 * * *');
  });

  it('reflects field + period state', () => {
    store.set(periodState, period('week'));
    store.set(minuteState, [DEFAULT_MINUTE_OPTS[30]]);
    store.set(hourState, [DEFAULT_HOUR_OPTS_EVERY[9]]);
    store.set(weekState, [{ value: '1', label: 'Monday' }]);
    expect(store.get(cronExpState)).toBe('30 9 * * 1');
  });
});

describe('cronExpState writer (parsing into field atoms)', () => {
  // The period atom is `atomWithDefault`; its override does not persist in an
  // unmounted Node store (it persists once mounted, as in the browser). So these
  // assertions check the plain field atoms that the writer parses into.
  it('parses minutes/hours into the field atoms', () => {
    store.set(cronExpState, '30 9 * * *');
    expect(store.get(minuteState).map((m) => m.value)).toEqual(['30']);
    expect(store.get(hourState).map((h) => h.value)).toEqual(['9']);
  });

  it('parses a day-of-month value', () => {
    store.set(cronExpState, '0 0 5 * *');
    expect(store.get(dayOfMonthState).map((d) => d.value)).toEqual(['5']);
  });

  it('does not mutate field atoms for an invalid expression', () => {
    store.set(minuteState, [DEFAULT_MINUTE_OPTS[7]]);
    store.set(cronExpState, '99 99 * * *'); // invalid
    expect(store.get(minuteState).map((m) => m.value)).toEqual(['7']);
  });
});
