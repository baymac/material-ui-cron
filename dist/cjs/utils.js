"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isAscending = isAscending;
exports.getTimesOfTheDayList = getTimesOfTheDayList;
exports.getTimesOfTheDay = getTimesOfTheDay;
exports.hasNoDuplicates = hasNoDuplicates;
exports.range = range;
exports.countOccurrences = exports.validateCronExp = exports.getCronStatus = exports.isValidMonthPart = exports.isValidDayOfWeekPart = exports.isValidDayOfMonthPart = exports.isValidHourPart = exports.isValidMinutePart = exports.CRON_VALIDATION = exports.REGEX_SINGLE_SPL = exports.REGEX_SINGLE_ALL = exports.REGEX_SINGLE_DIGIT = exports.REGEX_HYPHEN = exports.REGEX_COMMA = exports.REGEX_EVERY_HYPEN = exports.REGEX_EVERY = exports.REGEX_ALL = exports.hasValidNumbersInCronPart = exports.doesNumberStartWithZero = exports.getNumbersInCronPart = exports.hasValidCronParts = exports.isIncreasingSequence = exports.getSortedOptions = exports.getDayOfMonthIndex = exports.getPeriodIndex = exports.getMinutesIndex = exports.getTimeIndex = exports.getIndex = void 0;

var _constants = require("./constants");

var getIndex = function getIndex(obj, arr) {
  return arr.findIndex(function (x) {
    return x.value === obj.value;
  });
};

exports.getIndex = getIndex;

var getTimeIndex = function getTimeIndex(obj) {
  return getIndex(obj, getTimesOfTheDay());
};

exports.getTimeIndex = getTimeIndex;

var getMinutesIndex = function getMinutesIndex(obj) {
  return getIndex(obj, _constants.DEFAULT_MINUTE_OPTS);
};

exports.getMinutesIndex = getMinutesIndex;

var getPeriodIndex = function getPeriodIndex(obj) {
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

exports.getPeriodIndex = getPeriodIndex;

var getDayOfMonthIndex = function getDayOfMonthIndex(obj) {
  return getIndex(obj, _constants.DEFAULT_DAY_OF_MONTH_OPTS);
};

exports.getDayOfMonthIndex = getDayOfMonthIndex;

var getSortedOptions = function getSortedOptions(options) {
  return options.sort(function (a, b) {
    return Number(a.value) - Number(b.value);
  });
};

exports.getSortedOptions = getSortedOptions;

var isIncreasingSequence = function isIncreasingSequence(options) {
  return options.every(function (option, i) {
    return i === 0 || Number(options[i - 1].value) + 1 === Number(option.value);
  });
};

exports.isIncreasingSequence = isIncreasingSequence;

function isAscending(arr) {
  return arr.every(function (x, i) {
    return i === 0 || Number(x) >= Number(arr[i - 1]);
  });
}

function getTimesOfTheDayList() {
  var hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  var periods = ['AM', 'PM'];
  return periods.flatMap(function (period) {
    return hours.map(function (hour) {
      return hour > 9 ? "".concat(hour, ":00 ").concat(period) : "0".concat(hour, ":00 ").concat(period);
    });
  });
}

function getTimesOfTheDay() {
  return getTimesOfTheDayList().map(function (time) {
    return {
      value: time,
      label: time
    };
  });
}

var hasValidCronParts = function hasValidCronParts(cronExp) {
  return cronExp.split(' ').length === 5;
};

exports.hasValidCronParts = hasValidCronParts;

var getNumbersInCronPart = function getNumbersInCronPart(part) {
  var numbers = [];
  var tmpNumber = '';

  for (var i = 0; i < part.length; i++) {
    var num = Number(part[i]);

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

  return numbers.map(function (part) {
    return Number(part);
  });
};

exports.getNumbersInCronPart = getNumbersInCronPart;

var doesNumberStartWithZero = function doesNumberStartWithZero(part) {
  var tmpNumber = '';

  for (var i = 0; i < part.length; i++) {
    var num = Number(part[i]);

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

exports.doesNumberStartWithZero = doesNumberStartWithZero;

var hasValidNumbersInCronPart = function hasValidNumbersInCronPart(part, condition) {
  return getNumbersInCronPart(part).every(function (num) {
    return condition(num);
  });
};

exports.hasValidNumbersInCronPart = hasValidNumbersInCronPart;

function hasNoDuplicates(part) {
  var subparts = part.split('/');
  return subparts.every(function (subpart) {
    var numArr = getNumbersInCronPart(subpart);
    return new Set(numArr).size === numArr.length;
  });
}

var REGEX_ALL = /^([*])\/([1-9]{1})([0-9]{0,1})$/;
exports.REGEX_ALL = REGEX_ALL;
var REGEX_EVERY = /^([0-9]{1,4})\/([1-9]{1,2})$/;
exports.REGEX_EVERY = REGEX_EVERY;
var REGEX_EVERY_HYPEN = /^([0-9]{1,2}-[0-9]{1,2})\/([1-9]{1})?([0-9]{1})$/;
exports.REGEX_EVERY_HYPEN = REGEX_EVERY_HYPEN;
var REGEX_COMMA = /^[0-9]{1,2}(,[0-9]{1,2})+$/;
exports.REGEX_COMMA = REGEX_COMMA;
var REGEX_HYPHEN = /^([0-9]{1,2}-[0-9]{1,2})$/;
exports.REGEX_HYPHEN = REGEX_HYPHEN;
var REGEX_SINGLE_DIGIT = /^([0-9]{1,2})$/;
exports.REGEX_SINGLE_DIGIT = REGEX_SINGLE_DIGIT;
var REGEX_SINGLE_ALL = /^([*]{1})$/;
exports.REGEX_SINGLE_ALL = REGEX_SINGLE_ALL;
var REGEX_SINGLE_SPL = /^([L]{1})$/;
exports.REGEX_SINGLE_SPL = REGEX_SINGLE_SPL;

var CRON_VALIDATION = function CRON_VALIDATION(isValid, message) {
  return {
    isValid: isValid,
    message: message
  };
};

exports.CRON_VALIDATION = CRON_VALIDATION;

var isValidMinutePart = function isValidMinutePart(cronExp) {
  var part = cronExp.split(' ')[0];

  if (doesNumberStartWithZero(part)) {
    return CRON_VALIDATION(false, 'Number starts with zero');
  } else if (!hasValidNumbersInCronPart(part, function (num) {
    return num >= 0 && num <= 59;
  })) {
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

exports.isValidMinutePart = isValidMinutePart;

var isValidHourPart = function isValidHourPart(cronExp) {
  var part = cronExp.split(' ')[1];

  if (doesNumberStartWithZero(part)) {
    return CRON_VALIDATION(false, 'Number starts with zero');
  } else if (!hasValidNumbersInCronPart(part, function (num) {
    return num >= 0 && num <= 23;
  })) {
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

exports.isValidHourPart = isValidHourPart;

var isValidDayOfMonthPart = function isValidDayOfMonthPart(cronExp) {
  var part = cronExp.split(' ')[2];

  if (doesNumberStartWithZero(part)) {
    return CRON_VALIDATION(false, 'Number starts with zero');
  } else if (!hasValidNumbersInCronPart(part, function (num) {
    return num >= 1 && num <= 31;
  })) {
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

exports.isValidDayOfMonthPart = isValidDayOfMonthPart;

var isValidDayOfWeekPart = function isValidDayOfWeekPart(cronExp) {
  var part = cronExp.split(' ')[4];

  if (doesNumberStartWithZero(part)) {
    return CRON_VALIDATION(false, 'Number starts with zero');
  } else if (!hasValidNumbersInCronPart(part, function (num) {
    return num >= 0 && num <= 6;
  })) {
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

exports.isValidDayOfWeekPart = isValidDayOfWeekPart;

var isValidMonthPart = function isValidMonthPart(cronExp) {
  var part = cronExp.split(' ')[3];

  if (doesNumberStartWithZero(part)) {
    return CRON_VALIDATION(false, 'Number starts with zero');
  } else if (!hasValidNumbersInCronPart(part, function (num) {
    return num >= 1 && num <= 12;
  })) {
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

exports.isValidMonthPart = isValidMonthPart;

var getCronStatus = function getCronStatus(msg, hasError) {
  return {
    hasError: hasError,
    message: msg
  };
};

exports.getCronStatus = getCronStatus;

var validateCronExp = function validateCronExp(cronExp) {
  if (!hasValidCronParts(cronExp)) {
    return getCronStatus('Cron should have 5 parts', true);
  }

  var minuteValidation = isValidMinutePart(cronExp);

  if (!minuteValidation.isValid) {
    return getCronStatus("Invalid minute cron part: ".concat(minuteValidation.message), true);
  }

  var hourValidation = isValidHourPart(cronExp);

  if (!hourValidation.isValid) {
    return getCronStatus("Invalid hour cron part: ".concat(hourValidation.message), true);
  }

  var dayOfMonthValidation = isValidDayOfMonthPart(cronExp);

  if (!dayOfMonthValidation.isValid) {
    return getCronStatus("Invalid day of month cron part: ".concat(dayOfMonthValidation.message), true);
  }

  var monthValidation = isValidMonthPart(cronExp);

  if (!monthValidation.isValid) {
    return getCronStatus("Invalid month cron part: ".concat(monthValidation.message), true);
  }

  var dayOfWeekValidation = isValidDayOfWeekPart(cronExp);

  if (!dayOfWeekValidation.isValid) {
    return getCronStatus("Invalid day of week cron part: ".concat(dayOfWeekValidation.message), true);
  }

  return getCronStatus('', false);
};

exports.validateCronExp = validateCronExp;

var countOccurrences = function countOccurrences(arr, val) {
  return arr.reduce(function (a, v) {
    return v === val ? a + 1 : a;
  }, 0);
};

exports.countOccurrences = countOccurrences;

function range(start, end) {
  var step = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  var len = Math.floor((end - start) / step) + 1;
  return Array(len).fill('00').map(function (_, idx) {
    return "".concat(start + idx * step);
  });
}