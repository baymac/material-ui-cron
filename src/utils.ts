import { DEFAULT_MINUTE_OPTS } from './constants';
import type { CronValidation, SelectOptions } from './types';

export const getIndex = (obj: SelectOptions, arr: Array<SelectOptions>) => {
  return arr.findIndex((x) => x.value === obj.value);
};
export const getTimeIndex = (obj: SelectOptions) => {
  return getIndex(obj, getTimesOfTheDay());
};

export const getMinutesIndex = (obj: SelectOptions) => {
  return getIndex(obj, DEFAULT_MINUTE_OPTS);
};

export const getPeriodIndex = (obj: SelectOptions) => {
  if (obj.value === 'hour') {
    return 0;
  } else if (obj.value === 'day') {
    return 1;
  } else if (obj.value === 'week') {
    return 2;
  } else if (obj.value === 'month') {
    return 3;
  }
  return 4;
};

export const getSortedOptions = (options: SelectOptions[]) => {
  return options.sort((a, b) => Number(a.value) - Number(b.value));
};

export const isIncreasingSequence = (options: SelectOptions[]) =>
  options.every(
    (option, i) => i === 0 || Number(options[i - 1].value) + 1 === Number(option.value),
  );

// In `every` mode a field emits `start-end/N`. A cron range step begins at
// `start` and increments by `N`, so once `N` exceeds the span (`end - start`)
// only `start` ever matches and the schedule silently collapses to a single run
// per cycle ("could only run it once" — the step lands outside the range).
// Disable every interval option whose numeric value exceeds the span so a narrow
// window can never be made degenerate. Options at/below the span are left as-is
// (preserving any existing `disabled`, e.g. the `0` interval). Derive this fresh
// from the base options each render so widening the range re-enables them.
export const capIntervalOptionsToSpan = (
  options: SelectOptions[],
  span: number,
): SelectOptions[] =>
  options.map((option) =>
    Number(option.value) > span ? { ...option, disabled: true } : option,
  );

export function isAscending(arr: string[]) {
  return arr.every((x, i) => i === 0 || Number(x) >= Number(arr[i - 1]));
}

function getTimesOfTheDayList(): Array<string> {
  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const periods = ['AM', 'PM'];
  // On-the-hour only and no leading zero — "6 AM", not "06:00 AM" — so the
  // labels read naturally and the select stays narrow.
  return periods.flatMap((period) => hours.map((hour) => `${hour} ${period}`));
}

export function getTimesOfTheDay(): Array<SelectOptions> {
  return getTimesOfTheDayList().map((time) => ({
    value: time,
    label: time,
  }));
}

export const hasValidCronParts = (cronExp: string) => cronExp.split(' ').length === 5;

export const getNumbersInCronPart = (part: string) => {
  const numbers = [];
  let tmpNumber = '';
  for (let i = 0; i < part.length; i++) {
    const num = Number(part[i]);
    if (num >= 0 && num <= 9) {
      tmpNumber += num;
    } else {
      if (tmpNumber.length > 0) {
        numbers.push(tmpNumber);
      }
      tmpNumber = '';
    }
  }
  if (tmpNumber.length > 0) {
    numbers.push(tmpNumber);
  }
  return numbers.map((part) => Number(part));
};

export const doesNumberStartWithZero = (part: string) => {
  let tmpNumber = '';
  for (let i = 0; i < part.length; i++) {
    const num = Number(part[i]);
    if (num >= 0 && num <= 9) {
      tmpNumber += num;
    } else {
      if (tmpNumber.startsWith('0') && tmpNumber.length > 1) {
        return true;
      }
      tmpNumber = '';
    }
  }
  if (tmpNumber.startsWith('0') && tmpNumber.length > 1) {
    return true;
  }
  return false;
};

export const hasValidNumbersInCronPart = (part: string, condition: (n: number) => boolean) => {
  return getNumbersInCronPart(part).every((num) => condition(num));
};

export function hasNoDuplicates(part: string) {
  const subparts = part.split('/');
  return subparts.every((subpart) => {
    const numArr = getNumbersInCronPart(subpart);
    return new Set(numArr).size === numArr.length;
  });
}

const REGEX_ALL = /^([*])\/([1-9]{1})([0-9]{0,1})$/;
// Exported for direct unit testing of the step-part grammar.
export const REGEX_EVERY = /^([0-9]{1,4})\/([1-9]{1,2})$/;
const REGEX_EVERY_HYPEN = /^([0-9]{1,2}-[0-9]{1,2})\/([1-9]{1})?([0-9]{1})$/;
const REGEX_COMMA = /^[0-9]{1,2}(,[0-9]{1,2})+$/;
const REGEX_HYPHEN = /^([0-9]{1,2}-[0-9]{1,2})$/;
const REGEX_SINGLE_DIGIT = /^([0-9]{1,2})$/;
const REGEX_SINGLE_ALL = /^([*]{1})$/;
const REGEX_SINGLE_SPL = /^([L]{1})$/;

const CRON_VALIDATION = (isValid: boolean, message: string): CronValidation => {
  return {
    isValid,
    message,
  };
};

// Validates a step part (`a/b`) by branching on what comes before the slash:
//   `*`      -> `*/n`        (REGEX_ALL,         e.g. */4)
//   `x-y`    -> `x-y/n`      (REGEX_EVERY_HYPEN, e.g. 1-10/4)  when ascending
//   `n`      -> `n/m`        (REGEX_EVERY,       e.g. 1/4)
// The minute/hour/day-of-month parts share identical step semantics.
export const isValidStepPart = (part: string): CronValidation => {
  const beforeSlash = part.split('/')[0];
  if (beforeSlash === '*') {
    return CRON_VALIDATION(REGEX_ALL.test(part), 'has an invalid step');
  } else if (beforeSlash.indexOf('-') > 0) {
    if (isAscending(beforeSlash.split('-'))) {
      return CRON_VALIDATION(REGEX_EVERY_HYPEN.test(part), 'has an invalid step');
    }
    return CRON_VALIDATION(false, 'range must be low to high');
  }
  return CRON_VALIDATION(REGEX_EVERY.test(part), 'has an invalid step');
};

// Each validator returns a lowercase *reason clause* (e.g. "must be between 0
// and 59"); validateCronExp prepends the field name ("Minute", "Hour", ...) so
// the surfaced message reads as a plain sentence. Reasons are empty on the
// valid branches since they are never shown.
export const isValidMinutePart = (cronExp: string) => {
  const part = cronExp.split(' ')[0];
  if (doesNumberStartWithZero(part)) {
    return CRON_VALIDATION(false, 'has a leading zero');
  } else if (!hasValidNumbersInCronPart(part, (num: number) => num >= 0 && num <= 59)) {
    return CRON_VALIDATION(false, 'must be between 0 and 59');
  } else if (!hasNoDuplicates(part)) {
    return CRON_VALIDATION(false, 'has duplicate values');
  } else if (part.indexOf('/') > 0) {
    return isValidStepPart(part);
  } else if (part.indexOf(',') > 0) {
    return CRON_VALIDATION(REGEX_COMMA.test(part), 'has an invalid list');
  } else if (part.indexOf('-') > 0) {
    if (isAscending(part.split('-'))) {
      return CRON_VALIDATION(REGEX_HYPHEN.test(part), 'has an invalid range');
    } else {
      return CRON_VALIDATION(false, 'range must be low to high');
    }
  } else if (REGEX_SINGLE_DIGIT.test(part)) {
    return CRON_VALIDATION(true, '');
  }
  return CRON_VALIDATION(REGEX_SINGLE_ALL.test(part), 'is invalid');
};

export const isValidHourPart = (cronExp: string) => {
  const part = cronExp.split(' ')[1];
  if (doesNumberStartWithZero(part)) {
    return CRON_VALIDATION(false, 'has a leading zero');
  } else if (!hasValidNumbersInCronPart(part, (num: number) => num >= 0 && num <= 23)) {
    return CRON_VALIDATION(false, 'must be between 0 and 23');
  } else if (!hasNoDuplicates(part)) {
    return CRON_VALIDATION(false, 'has duplicate values');
  } else if (part.indexOf('/') > 0) {
    return isValidStepPart(part);
  } else if (part.indexOf(',') > 0) {
    return CRON_VALIDATION(REGEX_COMMA.test(part), 'has an invalid list');
  } else if (part.indexOf('-') > 0) {
    if (isAscending(part.split('-'))) {
      return CRON_VALIDATION(REGEX_HYPHEN.test(part), 'has an invalid range');
    } else {
      return CRON_VALIDATION(false, 'range must be low to high');
    }
  } else if (REGEX_SINGLE_DIGIT.test(part)) {
    return CRON_VALIDATION(true, '');
  }
  return CRON_VALIDATION(REGEX_SINGLE_ALL.test(part), 'is invalid');
};

export const isValidDayOfMonthPart = (cronExp: string) => {
  const part = cronExp.split(' ')[2];
  if (doesNumberStartWithZero(part)) {
    return CRON_VALIDATION(false, 'has a leading zero');
  } else if (!hasValidNumbersInCronPart(part, (num: number) => num >= 1 && num <= 31)) {
    return CRON_VALIDATION(false, 'must be between 1 and 31');
  } else if (!hasNoDuplicates(part)) {
    return CRON_VALIDATION(false, 'has duplicate values');
  } else if (part.indexOf('/') > 0) {
    return isValidStepPart(part);
  } else if (part.indexOf(',') > 0) {
    return CRON_VALIDATION(REGEX_COMMA.test(part), 'has an invalid list');
  } else if (part.indexOf('-') > 0) {
    if (isAscending(part.split('-'))) {
      return CRON_VALIDATION(REGEX_HYPHEN.test(part), 'has an invalid range');
    } else {
      return CRON_VALIDATION(false, 'range must be low to high');
    }
  } else if (REGEX_SINGLE_DIGIT.test(part)) {
    return CRON_VALIDATION(true, '');
  } else if (REGEX_SINGLE_SPL.test(part)) {
    return CRON_VALIDATION(true, '');
  }
  return CRON_VALIDATION(REGEX_SINGLE_ALL.test(part), 'is invalid');
};

export const isValidDayOfWeekPart = (cronExp: string) => {
  const part = cronExp.split(' ')[4];
  if (doesNumberStartWithZero(part)) {
    return CRON_VALIDATION(false, 'has a leading zero');
  } else if (!hasValidNumbersInCronPart(part, (num: number) => num >= 0 && num <= 6)) {
    return CRON_VALIDATION(false, 'must be between 0 and 6');
  } else if (!hasNoDuplicates(part)) {
    return CRON_VALIDATION(false, 'has duplicate values');
  } else if (part.indexOf(',') > 0) {
    return CRON_VALIDATION(REGEX_COMMA.test(part), 'has an invalid list');
  } else if (part.indexOf('-') > 0) {
    if (isAscending(part.split('-'))) {
      return CRON_VALIDATION(REGEX_HYPHEN.test(part), 'has an invalid range');
    } else {
      return CRON_VALIDATION(false, 'range must be low to high');
    }
  } else if (REGEX_SINGLE_DIGIT.test(part)) {
    return CRON_VALIDATION(true, '');
  }
  return CRON_VALIDATION(REGEX_SINGLE_ALL.test(part), 'is invalid');
};

export const isValidMonthPart = (cronExp: string) => {
  const part = cronExp.split(' ')[3];
  if (doesNumberStartWithZero(part)) {
    return CRON_VALIDATION(false, 'has a leading zero');
  } else if (!hasValidNumbersInCronPart(part, (num: number) => num >= 1 && num <= 12)) {
    return CRON_VALIDATION(false, 'must be between 1 and 12');
  } else if (!hasNoDuplicates(part)) {
    return CRON_VALIDATION(false, 'has duplicate values');
  } else if (part.indexOf(',') > 0) {
    return CRON_VALIDATION(REGEX_COMMA.test(part), 'has an invalid list');
  } else if (part.indexOf('-') > 0) {
    if (isAscending(part.split('-'))) {
      return CRON_VALIDATION(REGEX_HYPHEN.test(part), 'has an invalid range');
    } else {
      return CRON_VALIDATION(false, 'range must be low to high');
    }
  } else if (REGEX_SINGLE_DIGIT.test(part)) {
    return CRON_VALIDATION(true, '');
  }
  return CRON_VALIDATION(REGEX_SINGLE_ALL.test(part), 'is invalid');
};

const getCronStatus = (msg: string, hasError: boolean) => ({
  hasError: hasError,
  message: msg,
});

export const validateCronExp = (cronExp: string) => {
  if (!hasValidCronParts(cronExp)) {
    return getCronStatus('A cron expression must have 5 parts', true);
  }
  const minuteValidation = isValidMinutePart(cronExp);
  if (!minuteValidation.isValid) {
    return getCronStatus(`Minute ${minuteValidation.message}`, true);
  }
  const hourValidation = isValidHourPart(cronExp);
  if (!hourValidation.isValid) {
    return getCronStatus(`Hour ${hourValidation.message}`, true);
  }
  const dayOfMonthValidation = isValidDayOfMonthPart(cronExp);
  if (!dayOfMonthValidation.isValid) {
    return getCronStatus(`Day of month ${dayOfMonthValidation.message}`, true);
  }
  const monthValidation = isValidMonthPart(cronExp);
  if (!monthValidation.isValid) {
    return getCronStatus(`Month ${monthValidation.message}`, true);
  }
  const dayOfWeekValidation = isValidDayOfWeekPart(cronExp);
  if (!dayOfWeekValidation.isValid) {
    return getCronStatus(`Day of week ${dayOfWeekValidation.message}`, true);
  }
  return getCronStatus('', false);
};

export const countOccurrences = (arr: string[], val: string) =>
  arr.reduce((a, v) => (v === val ? a + 1 : a), 0);

