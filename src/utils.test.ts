import { describe, expect, it } from 'vitest';
import type { SelectOptions } from './types';
import {
  capIntervalOptionsToSpan,
  countOccurrences,
  doesNumberStartWithZero,
  getNumbersInCronPart,
  getPeriodIndex,
  getSortedOptions,
  hasNoDuplicates,
  hasValidCronParts,
  hasValidNumbersInCronPart,
  isAscending,
  isIncreasingSequence,
  isValidDayOfMonthPart,
  isValidDayOfWeekPart,
  isValidHourPart,
  isValidMinutePart,
  isValidMonthPart,
  isValidStepPart,
  validateCronExp,
} from './utils';
import { range } from './range';

const opt = (value: string): SelectOptions => ({ value, label: value });

describe('hasValidCronParts', () => {
  it('accepts exactly five space-separated parts', () => {
    expect(hasValidCronParts('* * * * *')).toBe(true);
    expect(hasValidCronParts('0 0 1 1 0')).toBe(true);
  });

  it('rejects the wrong number of parts', () => {
    expect(hasValidCronParts('* * * *')).toBe(false);
    expect(hasValidCronParts('* * * * * *')).toBe(false);
  });
});

describe('getNumbersInCronPart', () => {
  it('extracts every numeric token', () => {
    expect(getNumbersInCronPart('1-10/4')).toEqual([1, 10, 4]);
    expect(getNumbersInCronPart('1,2,3')).toEqual([1, 2, 3]);
    expect(getNumbersInCronPart('*')).toEqual([]);
    expect(getNumbersInCronPart('5')).toEqual([5]);
  });
});

describe('doesNumberStartWithZero', () => {
  it('flags multi-digit numbers with a leading zero', () => {
    expect(doesNumberStartWithZero('01')).toBe(true);
    expect(doesNumberStartWithZero('00')).toBe(true);
    expect(doesNumberStartWithZero('0-05')).toBe(true);
  });

  it('does not flag a bare zero or normal numbers', () => {
    expect(doesNumberStartWithZero('0')).toBe(false);
    expect(doesNumberStartWithZero('10')).toBe(false);
    expect(doesNumberStartWithZero('1-10')).toBe(false);
  });
});

describe('hasNoDuplicates', () => {
  it('detects duplicate numbers within a list', () => {
    expect(hasNoDuplicates('1,2,3')).toBe(true);
    expect(hasNoDuplicates('1,2,2')).toBe(false);
  });

  it('treats slash sub-parts independently', () => {
    expect(hasNoDuplicates('1-10/4')).toBe(true);
  });
});

describe('hasValidNumbersInCronPart', () => {
  it('applies the predicate to every number', () => {
    expect(hasValidNumbersInCronPart('1,2,3', (n) => n >= 0 && n <= 59)).toBe(true);
    expect(hasValidNumbersInCronPart('1,60', (n) => n >= 0 && n <= 59)).toBe(false);
  });
});

describe('isAscending', () => {
  it('is true for non-decreasing sequences', () => {
    expect(isAscending(['1', '2', '2', '3'])).toBe(true);
    expect(isAscending(['5'])).toBe(true);
  });

  it('is false when a later value is smaller', () => {
    expect(isAscending(['3', '1'])).toBe(false);
  });
});

describe('isIncreasingSequence', () => {
  it('is true for a contiguous run', () => {
    expect(isIncreasingSequence([opt('1'), opt('2'), opt('3')])).toBe(true);
  });

  it('is false when there is a gap', () => {
    expect(isIncreasingSequence([opt('1'), opt('3')])).toBe(false);
  });
});

describe('getSortedOptions', () => {
  it('sorts options numerically by value', () => {
    expect(getSortedOptions([opt('10'), opt('2'), opt('1')]).map((o) => o.value)).toEqual([
      '1',
      '2',
      '10',
    ]);
  });
});

describe('capIntervalOptionsToSpan', () => {
  const opts = [opt('1'), opt('2'), opt('3'), opt('4'), opt('5'), opt('6')];

  it('disables every interval option above the span', () => {
    // span 4 -> a `55-59` window: 1..4 selectable, 5+ would collapse to one run.
    const capped = capIntervalOptionsToSpan(opts, 4);
    expect(capped.filter((o) => !o.disabled).map((o) => o.value)).toEqual(['1', '2', '3', '4']);
    expect(capped.filter((o) => o.disabled).map((o) => o.value)).toEqual(['5', '6']);
  });

  it('keeps the option equal to the span enabled (start + end both fire)', () => {
    expect(capIntervalOptionsToSpan(opts, 4).find((o) => o.value === '4')?.disabled).toBeFalsy();
  });

  it('disables nothing when the span covers every option', () => {
    expect(capIntervalOptionsToSpan(opts, 100).some((o) => o.disabled)).toBe(false);
  });

  it('preserves an already-disabled option below the span (e.g. the 0 interval)', () => {
    const withZero = [{ ...opt('0'), disabled: true }, opt('1'), opt('2')];
    const capped = capIntervalOptionsToSpan(withZero, 5);
    expect(capped.find((o) => o.value === '0')?.disabled).toBe(true);
  });

  it('does not mutate the input array', () => {
    const input = [opt('1'), opt('9')];
    capIntervalOptionsToSpan(input, 4);
    expect(input.every((o) => o.disabled === undefined)).toBe(true);
  });
});

describe('getPeriodIndex', () => {
  it('maps period values to their index', () => {
    expect(getPeriodIndex(opt('hour'))).toBe(0);
    expect(getPeriodIndex(opt('day'))).toBe(1);
    expect(getPeriodIndex(opt('week'))).toBe(2);
    expect(getPeriodIndex(opt('month'))).toBe(3);
    expect(getPeriodIndex(opt('year'))).toBe(4);
  });
});

describe('countOccurrences', () => {
  it('counts matching entries', () => {
    expect(countOccurrences(['a', 'b', 'a'], 'a')).toBe(2);
    expect(countOccurrences([], 'a')).toBe(0);
  });
});

describe('range', () => {
  it('builds an inclusive string range', () => {
    expect(range(0, 4)).toEqual(['0', '1', '2', '3', '4']);
  });

  it('honours a custom step', () => {
    expect(range(0, 10, 5)).toEqual(['0', '5', '10']);
  });
});

describe('isValidStepPart (#19 step validation)', () => {
  it('accepts `*/n`', () => {
    expect(isValidStepPart('*/4').isValid).toBe(true);
    expect(isValidStepPart('*/15').isValid).toBe(true);
  });

  it('accepts plain `n/m` — the #19 regression', () => {
    expect(isValidStepPart('1/4').isValid).toBe(true);
    expect(isValidStepPart('5/15').isValid).toBe(true);
  });

  it('keeps the existing step-value constraint (no `0` digit in the step)', () => {
    // REGEX_EVERY's step group is [1-9]{1,2}, so steps like 10/20 are rejected.
    // This is pre-existing behaviour, documented here so the boundary is intentional.
    expect(isValidStepPart('5/10').isValid).toBe(false);
  });

  it('accepts an ascending `x-y/n` range step', () => {
    expect(isValidStepPart('1-10/4').isValid).toBe(true);
  });

  it('rejects a descending range step', () => {
    const res = isValidStepPart('10-1/4');
    expect(res.isValid).toBe(false);
    expect(res.message).toBe('range must be low to high');
  });

  it('rejects malformed step parts', () => {
    expect(isValidStepPart('1/').isValid).toBe(false);
    expect(isValidStepPart('*/0').isValid).toBe(false);
  });
});

describe('isValidMinutePart', () => {
  it.each(['*', '5', '0', '1,2,3', '1-30', '*/5', '0/15', '1-30/5'])('accepts %s', (part) => {
    expect(isValidMinutePart(`${part} * * * *`).isValid).toBe(true);
  });

  it('rejects out-of-range minutes', () => {
    expect(isValidMinutePart('60 * * * *').isValid).toBe(false);
  });

  it('rejects leading zero', () => {
    expect(isValidMinutePart('05 * * * *').isValid).toBe(false);
  });

  it('rejects duplicates', () => {
    expect(isValidMinutePart('1,1 * * * *').isValid).toBe(false);
  });

  it('rejects a descending range', () => {
    expect(isValidMinutePart('30-10 * * * *').isValid).toBe(false);
  });
});

describe('isValidHourPart', () => {
  it.each(['*', '9', '1/4', '*/4', '1-10/4'])('accepts %s', (part) => {
    expect(isValidHourPart(`0 ${part} * * *`).isValid).toBe(true);
  });

  it('rejects out-of-range hours', () => {
    expect(isValidHourPart('0 24 * * *').isValid).toBe(false);
  });
});

describe('isValidDayOfMonthPart', () => {
  it.each(['*', '1', '15', 'L', '1-15', '1/5'])('accepts %s', (part) => {
    expect(isValidDayOfMonthPart(`0 0 ${part} * *`).isValid).toBe(true);
  });

  it('rejects day 0 and out-of-range days', () => {
    expect(isValidDayOfMonthPart('0 0 0 * *').isValid).toBe(false);
    expect(isValidDayOfMonthPart('0 0 32 * *').isValid).toBe(false);
  });
});

describe('isValidMonthPart', () => {
  it.each(['*', '1', '12', '1,6,12', '1-6'])('accepts %s', (part) => {
    expect(isValidMonthPart(`0 0 1 ${part} *`).isValid).toBe(true);
  });

  it('rejects out-of-range months', () => {
    expect(isValidMonthPart('0 0 1 13 *').isValid).toBe(false);
  });
});

describe('isValidDayOfWeekPart', () => {
  it.each(['*', '0', '6', '1-5', '1,3,5'])('accepts %s', (part) => {
    expect(isValidDayOfWeekPart(`0 0 * * ${part}`).isValid).toBe(true);
  });

  it('rejects out-of-range weekdays', () => {
    expect(isValidDayOfWeekPart('0 0 * * 7').isValid).toBe(false);
  });
});

describe('validateCronExp (end-to-end)', () => {
  const valid = [
    '* * * * *',
    '0 0 * * *',
    '0 1/4 * * *', // #19
    '*/5 * * * *',
    '0 */4 * * *',
    '0 1-10/4 * * *',
    '0 0 1/5 * *',
    '0 0 1-15 * *',
    '30 9 * * 1',
    '0 0 L * *',
    '0 0 1 1 0',
  ];
  it.each(valid)('accepts %s', (cron) => {
    expect(validateCronExp(cron).hasError).toBe(false);
  });

  const invalid: [string, string][] = [
    ['0 1/4 * *', 'A cron expression must have 5 parts'],
    ['60 * * * *', 'Minute must be between 0 and 59'],
    ['0 24 * * *', 'Hour must be between 0 and 23'],
    ['0 10-1/4 * * *', 'Hour range must be low to high'],
    ['0 0 32 * *', 'Day of month must be between 1 and 31'],
    ['0 0 1 13 *', 'Month must be between 1 and 12'],
    ['0 0 * * 7', 'Day of week must be between 0 and 6'],
  ];
  it.each(invalid)('rejects %s', (cron, message) => {
    const res = validateCronExp(cron);
    expect(res.hasError).toBe(true);
    expect(res.message).toBe(message);
  });
});
