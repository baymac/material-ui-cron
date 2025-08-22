import { DEFAULT_DAY_OF_MONTH_OPTS, DEFAULT_MINUTE_OPTS } from './constants';
export const getIndex = (obj, arr) => {
  return arr.findIndex(x => x.value === obj.value);
};
export const getTimeIndex = obj => {
  return getIndex(obj, getTimesOfTheDay());
};
export const getMinutesIndex = obj => {
  return getIndex(obj, DEFAULT_MINUTE_OPTS);
};
export const getPeriodIndex = obj => {
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
export const getDayOfMonthIndex = obj => {
  return getIndex(obj, DEFAULT_DAY_OF_MONTH_OPTS);
};
export const getSortedOptions = options => {
  return options.sort((a, b) => Number(a.value) - Number(b.value));
};
export const isIncreasingSequence = options => options.every((option, i) => i === 0 || Number(options[i - 1].value) + 1 === Number(option.value));
export function isAscending(arr) {
  return arr.every(function (x, i) {
    return i === 0 || Number(x) >= Number(arr[i - 1]);
  });
}
export function getTimesOfTheDayList() {
  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const periods = ['AM', 'PM'];
  return periods.flatMap(period => hours.map(hour => hour > 9 ? `${hour}:00 ${period}` : `0${hour}:00 ${period}`));
}
export function getTimesOfTheDay() {
  return getTimesOfTheDayList().map(time => ({
    value: time,
    label: time
  }));
}
export const hasValidCronParts = cronExp => cronExp.split(' ').length === 5;
export const getNumbersInCronPart = part => {
  let numbers = [];
  let tmpNumber = '';

  for (let i = 0; i < part.length; i++) {
    let num = Number(part[i]);

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

  return numbers.map(part => Number(part));
};
export const doesNumberStartWithZero = part => {
  let tmpNumber = '';

  for (let i = 0; i < part.length; i++) {
    let num = Number(part[i]);

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
export const hasValidNumbersInCronPart = (part, condition) => {
  return getNumbersInCronPart(part).every(num => condition(num));
};
export function hasNoDuplicates(part) {
  const subparts = part.split('/');
  return subparts.every(subpart => {
    let numArr = getNumbersInCronPart(subpart);
    return new Set(numArr).size === numArr.length;
  });
}
export const REGEX_ALL = /^([*])\/([1-9]{1})([0-9]{0,1})$/;
export const REGEX_EVERY = /^([0-9]{1,4})\/([1-9]{1,2})$/;
export const REGEX_EVERY_HYPEN = /^([0-9]{1,2}-[0-9]{1,2})\/([1-9]{1})?([0-9]{1})$/;
export const REGEX_COMMA = /^[0-9]{1,2}(,[0-9]{1,2})+$/;
export const REGEX_HYPHEN = /^([0-9]{1,2}-[0-9]{1,2})$/;
export const REGEX_SINGLE_DIGIT = /^([0-9]{1,2})$/;
export const REGEX_SINGLE_ALL = /^([*]{1})$/;
export const REGEX_SINGLE_SPL = /^([L]{1})$/;
export const CRON_VALIDATION = (isValid, message) => {
  return {
    isValid,
    message
  };
};
export const isValidMinutePart = cronExp => {
  const part = cronExp.split(' ')[0];

  if (doesNumberStartWithZero(part)) {
    return CRON_VALIDATION(false, 'Number starts with zero');
  } else if (!hasValidNumbersInCronPart(part, num => num >= 0 && num <= 59)) {
    return CRON_VALIDATION(false, 'Number should be between 0 and 59');
  } else if (!hasNoDuplicates(part)) {
    return CRON_VALIDATION(false, 'Duplicate numbers not allowed');
  } else if (part.indexOf('/') > 0) {
    if (part.split('/')[0] !== '*' && isAscending(part.split('/')[0].split('-'))) {
      return CRON_VALIDATION(REGEX_EVERY_HYPEN.test(part), 'Incorrect syntax hypen');
    } else if (part.indexOf('-') > 0) {
      return CRON_VALIDATION(false, 'Incorrect range');
    } else {
      return CRON_VALIDATION(REGEX_ALL.test(part), 'Incorrect syntax');
    }
  } else if (part.indexOf(',') > 0) {
    return CRON_VALIDATION(REGEX_COMMA.test(part), 'Invalid syntax');
  } else if (part.indexOf('-') > 0) {
    if (isAscending(part.split('-'))) {
      return CRON_VALIDATION(REGEX_HYPHEN.test(part), 'Invalid range');
    } else {
      return CRON_VALIDATION(false, 'Invalid range');
    }
  } else if (REGEX_SINGLE_DIGIT.test(part)) {
    return CRON_VALIDATION(true, 'Invalid single digit');
  }

  return CRON_VALIDATION(REGEX_SINGLE_ALL.test(part), 'Invalid single all');
};
export const isValidHourPart = cronExp => {
  const part = cronExp.split(' ')[1];

  if (doesNumberStartWithZero(part)) {
    return CRON_VALIDATION(false, 'Number starts with zero');
  } else if (!hasValidNumbersInCronPart(part, num => num >= 0 && num <= 23)) {
    return CRON_VALIDATION(false, 'Number should be between 0 and 23');
  } else if (!hasNoDuplicates(part)) {
    return CRON_VALIDATION(false, 'Duplicate numbers not allowed');
  } else if (part.indexOf('/') > 0) {
    if (part.split('/')[0] !== '*' && isAscending(part.split('/')[0].split('-'))) {
      return CRON_VALIDATION(REGEX_EVERY_HYPEN.test(part), 'Incorrect syntax hypen');
    } else if (part.indexOf('-') > 0) {
      return CRON_VALIDATION(false, 'Incorrect range');
    } else {
      return CRON_VALIDATION(REGEX_ALL.test(part), 'Incorrect syntax');
    }
  } else if (part.indexOf(',') > 0) {
    return CRON_VALIDATION(REGEX_COMMA.test(part), 'Invalid syntax');
  } else if (part.indexOf('-') > 0) {
    if (isAscending(part.split('-'))) {
      return CRON_VALIDATION(REGEX_HYPHEN.test(part), 'Invalid range');
    } else {
      return CRON_VALIDATION(false, 'Invalid range');
    }
  } else if (REGEX_SINGLE_DIGIT.test(part)) {
    return CRON_VALIDATION(true, 'Invalid single digit');
  }

  return CRON_VALIDATION(REGEX_SINGLE_ALL.test(part), 'Invalid single all');
};
export const isValidDayOfMonthPart = cronExp => {
  const part = cronExp.split(' ')[2];

  if (doesNumberStartWithZero(part)) {
    return CRON_VALIDATION(false, 'Number starts with zero');
  } else if (!hasValidNumbersInCronPart(part, num => num >= 1 && num <= 31)) {
    return CRON_VALIDATION(false, 'Number should be between 1 and 31');
  } else if (!hasNoDuplicates(part)) {
    return CRON_VALIDATION(false, 'Duplicate numbers not allowed');
  } else if (part.indexOf('/') > 0) {
    if (part.split('/')[0] !== '*' && isAscending(part.split('/')[0].split('-'))) {
      return CRON_VALIDATION(REGEX_EVERY_HYPEN.test(part), 'Incorrect syntax hypen');
    } else if (part.indexOf('-') > 0) {
      return CRON_VALIDATION(false, 'Incorrect range');
    } else {
      return CRON_VALIDATION(REGEX_ALL.test(part), 'Incorrect syntax');
    }
  } else if (part.indexOf(',') > 0) {
    return CRON_VALIDATION(REGEX_COMMA.test(part), 'Invalid syntax');
  } else if (part.indexOf('-') > 0) {
    if (isAscending(part.split('-'))) {
      return CRON_VALIDATION(REGEX_HYPHEN.test(part), 'Invalid range');
    } else {
      return CRON_VALIDATION(false, 'Invalid range');
    }
  } else if (REGEX_SINGLE_DIGIT.test(part)) {
    return CRON_VALIDATION(true, '');
  } else if (REGEX_SINGLE_SPL.test(part)) {
    return CRON_VALIDATION(true, '');
  }

  return CRON_VALIDATION(REGEX_SINGLE_ALL.test(part), 'Invalid single all');
};
export const isValidDayOfWeekPart = cronExp => {
  const part = cronExp.split(' ')[4];

  if (doesNumberStartWithZero(part)) {
    return CRON_VALIDATION(false, 'Number starts with zero');
  } else if (!hasValidNumbersInCronPart(part, num => num >= 0 && num <= 6)) {
    return CRON_VALIDATION(false, 'Number should be between 0 and 6');
  } else if (!hasNoDuplicates(part)) {
    return CRON_VALIDATION(false, 'Duplicate numbers not allowed');
  } else if (part.indexOf(',') > 0) {
    return CRON_VALIDATION(REGEX_COMMA.test(part), 'Invalid syntax');
  } else if (part.indexOf('-') > 0) {
    if (isAscending(part.split('-'))) {
      return CRON_VALIDATION(REGEX_HYPHEN.test(part), 'Incorrect syntax hypen');
    } else {
      return CRON_VALIDATION(false, 'Range should be low to high');
    }
  } else if (REGEX_SINGLE_DIGIT.test(part)) {
    return CRON_VALIDATION(true, 'Invalid single digit');
  }

  return CRON_VALIDATION(REGEX_SINGLE_ALL.test(part), 'Invalid single all');
};
export const isValidMonthPart = cronExp => {
  const part = cronExp.split(' ')[3];

  if (doesNumberStartWithZero(part)) {
    return CRON_VALIDATION(false, 'Number starts with zero');
  } else if (!hasValidNumbersInCronPart(part, num => num >= 1 && num <= 12)) {
    return CRON_VALIDATION(false, 'Number should be between 0 and 6');
  } else if (!hasNoDuplicates(part)) {
    return CRON_VALIDATION(false, 'Duplicate numbers not allowed');
  } else if (part.indexOf(',') > 0) {
    return CRON_VALIDATION(REGEX_COMMA.test(part), 'Invalid syntax');
  } else if (part.indexOf('-') > 0) {
    if (isAscending(part.split('-'))) {
      return CRON_VALIDATION(REGEX_HYPHEN.test(part), 'Incorrect syntax hypen');
    } else {
      return CRON_VALIDATION(false, 'Range should be low to high');
    }
  } else if (REGEX_SINGLE_DIGIT.test(part)) {
    return CRON_VALIDATION(true, 'Invalid single digit');
  }

  return CRON_VALIDATION(REGEX_SINGLE_ALL.test(part), 'Invalid single all');
};
export const getCronStatus = (msg, hasError) => ({
  hasError: hasError,
  message: msg
});
export const validateCronExp = cronExp => {
  if (!hasValidCronParts(cronExp)) {
    return getCronStatus('Cron should have 5 parts', true);
  }

  const minuteValidation = isValidMinutePart(cronExp);

  if (!minuteValidation.isValid) {
    return getCronStatus(`Invalid minute cron part: ${minuteValidation.message}`, true);
  }

  const hourValidation = isValidHourPart(cronExp);

  if (!hourValidation.isValid) {
    return getCronStatus(`Invalid hour cron part: ${hourValidation.message}`, true);
  }

  const dayOfMonthValidation = isValidDayOfMonthPart(cronExp);

  if (!dayOfMonthValidation.isValid) {
    return getCronStatus(`Invalid day of month cron part: ${dayOfMonthValidation.message}`, true);
  }

  const monthValidation = isValidMonthPart(cronExp);

  if (!monthValidation.isValid) {
    return getCronStatus(`Invalid month cron part: ${monthValidation.message}`, true);
  }

  const dayOfWeekValidation = isValidDayOfWeekPart(cronExp);

  if (!dayOfWeekValidation.isValid) {
    return getCronStatus(`Invalid day of week cron part: ${dayOfWeekValidation.message}`, true);
  }

  return getCronStatus('', false);
};
export const countOccurrences = (arr, val) => arr.reduce((a, v) => v === val ? a + 1 : a, 0);
export function range(start, end, step = 1) {
  const len = Math.floor((end - start) / step) + 1;
  return Array(len).fill('00').map((_, idx) => `${start + idx * step}`);
}