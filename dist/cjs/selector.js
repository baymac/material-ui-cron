"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cronExpState = exports.dayOfWeekCronState = exports.monthCronState = exports.dayOfMonthCronState = exports.hourCronState = exports.minuteCronState = void 0;

var _recoil = require("recoil");

var _constants = require("./constants");

var _store = require("./store");

var _utils = require("./utils");

var minuteCronState = (0, _recoil.selector)({
  key: 'minuteCronState',
  get: function get(_ref) {
    var _get = _ref.get;

    var minutes = _get(_store.minuteState);

    if (minutes.map(function (minute) {
      return minute.value;
    }).join('') === _constants.DEFAULT_MINUTE_OPTS.map(function (minute) {
      return minute.value;
    }).join('')) {
      return '*';
    } else if (_get(_store.minuteAtEveryState).value === 'every') {
      var startIndex = (0, _utils.getMinutesIndex)(_get(_store.minuteRangeStartSchedulerState));
      var endIndex = (0, _utils.getMinutesIndex)(_get(_store.minuteRangeEndSchedulerState));

      if (endIndex - startIndex === 59) {
        return "*/".concat(minutes.map(function (minute) {
          return minute.value;
        }).join(''));
      }

      return "".concat(startIndex, "-").concat(endIndex, "/").concat(minutes.map(function (minute) {
        return minute.value;
      }).join(''));
    } else if ((0, _utils.isIncreasingSequence)(minutes) && minutes.length !== 1) {
      return "".concat(minutes[0].value, "-").concat(minutes[minutes.length - 1].value);
    } else {
      return minutes.map(function (minute) {
        return minute.value;
      }).join(',');
    }
  }
});
exports.minuteCronState = minuteCronState;
var hourCronState = (0, _recoil.selector)({
  key: 'hourCronState',
  get: function get(_ref2) {
    var _get2 = _ref2.get;

    var hours = _get2(_store.hourState);

    if ((0, _utils.getPeriodIndex)(_get2(_store.periodState)) < 1 || hours.map(function (hour) {
      return hour.value;
    }).join('') === _constants.DEFAULT_HOUR_OPTS_EVERY.map(function (hour) {
      return hour.value;
    }).join('')) {
      return '*';
    } else if (_get2(_store.hourAtEveryState).value === 'every') {
      var startIndex = (0, _utils.getTimeIndex)(_get2(_store.hourRangeStartSchedulerState));
      var endIndex = (0, _utils.getTimeIndex)(_get2(_store.hourRangeEndSchedulerState));

      if (endIndex - startIndex === 23) {
        return "*/".concat(hours.map(function (hour) {
          return hour.value;
        }).join(''));
      }

      return "".concat(startIndex, "-").concat(endIndex, "/").concat(hours.map(function (hour) {
        return hour.value;
      }).join(''));
    } else if ((0, _utils.isIncreasingSequence)(hours) && hours.length !== 1) {
      return "".concat(hours[0].value, "-").concat(hours[hours.length - 1].value);
    } else {
      return hours.map(function (hour) {
        return hour.value;
      }).join(',');
    }
  }
});
exports.hourCronState = hourCronState;
var dayOfMonthCronState = (0, _recoil.selector)({
  key: 'dayOfMonthCronState',
  get: function get(_ref3) {
    var _get3 = _ref3.get;

    var dayOfMonth = _get3(_store.dayOfMonthState);

    if ((0, _utils.getPeriodIndex)(_get3(_store.periodState)) < 3 || dayOfMonth.map(function (dayOfMonth) {
      return dayOfMonth.value;
    }).join('') === _constants.DEFAULT_DAY_OF_MONTH_OPTS.map(function (day) {
      return day.value;
    }).join('')) {
      return '*';
    } else if (_get3(_store.dayOfMonthAtEveryState).value === 'every') {
      var startIndex = _get3(_store.dayOfMonthRangeStartSchedulerState).value;

      var endIndex = _get3(_store.dayOfMonthRangeEndSchedulerState).value;

      if (Number(endIndex) - Number(startIndex) === 30) {
        return "*/".concat(dayOfMonth.map(function (dayOfMonth) {
          return dayOfMonth.value;
        }).join(''));
      }

      return "".concat(startIndex, "-").concat(endIndex, "/").concat(dayOfMonth.map(function (dayOfMonth) {
        return dayOfMonth.value;
      }).join(''));
    } else if (dayOfMonth[0].value === 'L') {
      return 'L';
    } else if ((0, _utils.isIncreasingSequence)(dayOfMonth) && dayOfMonth.length !== 1) {
      return "".concat(dayOfMonth[0].value, "-").concat(dayOfMonth[dayOfMonth.length - 1].value);
    } else {
      return dayOfMonth.map(function (dayOfMonth) {
        return dayOfMonth.value;
      }).join(',');
    }
  }
});
exports.dayOfMonthCronState = dayOfMonthCronState;
var monthCronState = (0, _recoil.selector)({
  key: 'monthCronState',
  get: function get(_ref4) {
    var _get4 = _ref4.get;

    var months = _get4(_store.monthState);

    if ((0, _utils.getPeriodIndex)(_get4(_store.periodState)) < 4 || _get4(_store.monthState).map(function (month) {
      return month.value;
    }).join('') === (0, _constants.getMonthOptions)(_get4(_store.localeState).shortMonthOptions).map(function (month) {
      return month.value;
    }).join('')) {
      return '*';
    } else if ((0, _utils.isIncreasingSequence)(months) && months.length !== 1) {
      return "".concat(months[0].value, "-").concat(months[months.length - 1].value);
    } else {
      return months.map(function (month) {
        return month.value;
      }).join(',');
    }
  }
});
exports.monthCronState = monthCronState;
var dayOfWeekCronState = (0, _recoil.selector)({
  key: 'dayOfWeekCronState',
  get: function get(_ref5) {
    var _get5 = _ref5.get;

    var weeks = _get5(_store.weekState);

    if ((0, _utils.getPeriodIndex)(_get5(_store.periodState)) < 2) {
      return '*';
    } else if (_get5(_store.weekState).map(function (dayOfWeek) {
      return dayOfWeek.value;
    }).join('') === (0, _constants.weekOptions)(_get5(_store.localeState).weekDaysOptions).map(function (week) {
      return week.value;
    }).join('')) {
      return '*';
    } else if ((0, _utils.isIncreasingSequence)(weeks) && weeks.length !== 1) {
      return "".concat(weeks[0].value, "-").concat(weeks[weeks.length - 1].value);
    } else if (weeks.length === 1) {
      return weeks[0].value;
    } else {
      return weeks.map(function (week) {
        return week.value;
      }).join(',');
    }
  }
});
exports.dayOfWeekCronState = dayOfWeekCronState;
var cronExpState = (0, _recoil.selector)({
  key: 'cronExpState',
  get: function get(_ref6) {
    var _get6 = _ref6.get;
    return "".concat(_get6(minuteCronState), " ").concat(_get6(hourCronState), " ").concat(_get6(dayOfMonthCronState), " ").concat(_get6(monthCronState), " ").concat(_get6(dayOfWeekCronState));
  },
  set: function set(_ref7, newValue) {
    var get = _ref7.get,
        _set = _ref7.set;
    var res = (0, _utils.validateCronExp)(newValue.toString());

    _set(_store.cronValidationErrorMessageState, res.hasError ? res.message : '');

    if (!res.hasError) {
      var cronParts = newValue.toString().split(' ');
      generateMinute(cronParts[0], get(_store.localeState), _set);
      generateHour(cronParts[1], get(_store.localeState), _set);
      generateDayOfMonth(cronParts[2], get(_store.localeState), _set);
      generateMonth(cronParts[3], get(_store.localeState), _set);
      generateWeek(cronParts[4], get(_store.localeState), _set);
      var period = get(_store.periodState);
      var periodOptions = (0, _constants.getPeriodOptions)(get(_store.localeState).periodOptions);

      if (cronParts[3] !== '*' && (0, _utils.getPeriodIndex)(period) < 4) {
        _set(_store.periodState, periodOptions[4]);
      } else if (cronParts[2] !== '*' && (0, _utils.getPeriodIndex)(period) < 3) {
        _set(_store.periodState, periodOptions[3]);
      } else if (cronParts[4] !== '*' && (0, _utils.getPeriodIndex)(period) < 2) {
        _set(_store.periodState, periodOptions[2]);
      } else if (cronParts[1] !== '*' && (0, _utils.getPeriodIndex)(period) < 1) {
        _set(_store.periodState, periodOptions[1]);
      }
    }
  }
});
exports.cronExpState = cronExpState;

var generateMinute = function generateMinute(part, locale, set) {
  if (part.indexOf('/') > 0) {
    var subparts = part.split('/');
    set(_store.minuteAtEveryState, (0, _constants.atEveryOptions)(locale.atOptionLabel, locale.everyOptionLabel)[1]);

    if (subparts[0].indexOf('-') > 0) {
      var subsubparts = subparts[0].split('-');
      set(_store.minuteRangeStartSchedulerState, (0, _constants.defaultMinuteOptionsWithOrdinal)()[Number(subsubparts[0])]);
      set(_store.minuteRangeEndSchedulerState, (0, _constants.defaultMinuteOptionsWithOrdinal)()[Number(subsubparts[1])]);
    } else if (subparts[0] === '*') {
      set(_store.minuteRangeStartSchedulerState, (0, _constants.defaultMinuteOptionsWithOrdinal)()[0]);
      set(_store.minuteRangeEndSchedulerState, (0, _constants.defaultMinuteOptionsWithOrdinal)()[59]);
    }

    set(_store.minuteState, [_constants.DEFAULT_MINUTE_OPTS[Number(subparts[1])]]);
  } else if (part.indexOf('-') > 0) {
    var _subparts = part.split('-');

    set(_store.minuteState, _constants.DEFAULT_MINUTE_OPTS.filter(function (_, idx) {
      return idx >= Number(_subparts[0]) && idx <= Number(_subparts[1]);
    }));
  } else if (part !== '*') {
    set(_store.minuteAtEveryState, (0, _constants.atEveryOptions)(locale.atOptionLabel, locale.everyOptionLabel)[0]);
    set(_store.minuteState, _constants.DEFAULT_MINUTE_OPTS.filter(function (_, idx) {
      return part.split(',').includes(idx.toString());
    }));
  } else if (part === '*') {
    set(_store.minuteAtEveryState, (0, _constants.atEveryOptions)(locale.atOptionLabel, locale.everyOptionLabel)[0]);
    set(_store.minuteState, _constants.DEFAULT_MINUTE_OPTS);
  }
};

var generateHour = function generateHour(part, locale, set) {
  if (part.indexOf('/') > 0) {
    var subparts = part.split('/');
    set(_store.hourAtEveryState, (0, _constants.atEveryOptions)(locale.atOptionLabel, locale.everyOptionLabel)[1]);

    if (subparts[0].indexOf('-') > 0) {
      var subsubparts = subparts[0].split('-');
      set(_store.hourRangeStartSchedulerState, (0, _utils.getTimesOfTheDay)()[Number(subsubparts[0])]);
      set(_store.hourRangeEndSchedulerState, (0, _utils.getTimesOfTheDay)()[Number(subsubparts[1])]);
    } else if (subparts[0] === '*') {
      set(_store.hourRangeStartSchedulerState, (0, _utils.getTimesOfTheDay)()[0]);
      set(_store.hourRangeEndSchedulerState, (0, _utils.getTimesOfTheDay)()[23]);
    }

    set(_store.hourState, [_constants.DEFAULT_HOUR_OPTS_EVERY[Number(subparts[1])]]);
  } else if (part.indexOf('-') > 0) {
    var _subparts2 = part.split('-');

    set(_store.hourState, _constants.DEFAULT_HOUR_OPTS_EVERY.filter(function (_, idx) {
      return idx >= Number(_subparts2[0]) && idx <= Number(_subparts2[1]);
    }));
  } else if (part !== '*') {
    set(_store.hourAtEveryState, (0, _constants.atEveryOptions)(locale.atOptionLabel, locale.everyOptionLabel)[0]);
    set(_store.hourState, _constants.DEFAULT_HOUR_OPTS_EVERY.filter(function (_, idx) {
      return part.split(',').includes(idx.toString());
    }));
  } else if (part === '*') {
    set(_store.hourAtEveryState, (0, _constants.atEveryOptions)(locale.atOptionLabel, locale.everyOptionLabel)[0]);
    set(_store.hourState, _constants.DEFAULT_HOUR_OPTS_EVERY);
  }
};

var generateDayOfMonth = function generateDayOfMonth(part, locale, set) {
  if (part.indexOf('/') > 0) {
    var subparts = part.split('/');
    set(_store.dayOfMonthAtEveryState, (0, _constants.onEveryOptions)(locale.onOptionLabel, locale.everyOptionLabel)[1]);

    if (subparts[0].indexOf('-') > 0) {
      var subsubparts = subparts[0].split('-');
      set(_store.dayOfMonthRangeStartSchedulerState, _constants.DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD[Number(subsubparts[0]) - 1]);
      set(_store.dayOfMonthRangeEndSchedulerState, _constants.DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD[Number(subsubparts[1]) - 1]);
    } else if (subparts[0] === '*') {
      set(_store.dayOfMonthRangeStartSchedulerState, _constants.DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD[0]);
      set(_store.dayOfMonthRangeEndSchedulerState, _constants.DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD[30]);
    }

    set(_store.dayOfMonthState, [_constants.DEFAULT_DAY_OF_MONTH_OPTS[Number(subparts[1]) - 1]]);
  } else if (part === 'L') {
    set(_store.dayOfMonthAtEveryState, (0, _constants.onEveryOptions)(locale.onOptionLabel, locale.everyOptionLabel)[0]);
    set(_store.dayOfMonthState, [(0, _constants.getLastDayOfMonthOption)(locale.lastDayOfMonthLabel)]);
  } else if (part.indexOf('-') > 0) {
    var _subparts3 = part.split('-');

    set(_store.dayOfMonthState, _constants.DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD.filter(function (_, idx) {
      return idx + 1 >= Number(_subparts3[0]) && idx + 1 <= Number(_subparts3[1]);
    }));
  } else if (part !== '*') {
    set(_store.dayOfMonthAtEveryState, (0, _constants.onEveryOptions)(locale.onOptionLabel, locale.everyOptionLabel)[0]);
    set(_store.dayOfMonthState, _constants.DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD.filter(function (_, idx) {
      return part.split(',').includes((idx + 1).toString());
    }));
  } else if (part === '*') {
    set(_store.dayOfMonthAtEveryState, (0, _constants.onEveryOptions)(locale.onOptionLabel, locale.everyOptionLabel)[0]);
    set(_store.dayOfMonthState, _constants.DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD);
  }
};

var generateMonth = function generateMonth(part, locale, set) {
  if (part.indexOf('-') > 0) {
    var subparts = part.split('-');
    set(_store.monthState, (0, _constants.getMonthOptions)(locale.shortMonthOptions).filter(function (_, idx) {
      return idx + 1 >= Number(subparts[0]) && idx + 1 <= Number(subparts[1]);
    }));
  } else if (part !== '*') {
    set(_store.monthState, (0, _constants.getMonthOptions)(locale.shortMonthOptions).filter(function (_, idx) {
      return part.split(',').includes((idx + 1).toString());
    }));
  } else {
    set(_store.monthState, (0, _constants.getMonthOptions)(locale.shortMonthOptions));
  }
};

var generateWeek = function generateWeek(part, locale, set) {
  if (part.indexOf('-') > 0) {
    var subparts = part.split('-');
    set(_store.weekState, (0, _constants.weekOptions)(locale.weekDaysOptions).filter(function (_, idx) {
      return idx >= Number(subparts[0]) && idx <= Number(subparts[1]);
    }));
  } else if (part !== '*') {
    set(_store.weekState, (0, _constants.weekOptions)(locale.weekDaysOptions).filter(function (_, idx) {
      return part.split(',').includes(idx.toString());
    }));
  } else {
    set(_store.weekState, (0, _constants.weekOptions)(locale.weekDaysOptions));
  }
};