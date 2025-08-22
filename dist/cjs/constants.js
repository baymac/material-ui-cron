"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.onEveryOptions = exports.atOptionsNonAdmin = exports.everyOptionsNonAdmin = exports.atEveryOptions = exports.DEFAULT_MINUTE_OPTS = exports.defaultMinuteOptionsWithOrdinal = exports.defaultMinuteOptions = exports.DEFAULT_HOUR_OPTS_EVERY = exports.DEFAULT_HOUR_OPTS_AT = exports.defaultHourOptions = exports.defaultHourOptionsHr = exports.getMonthOptions = exports.DEFAULT_DAY_OF_MONTH_OPTS = exports.DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD = exports.getDayOfMonthsOptionsWithL = exports.getLastDayOfMonthOption = exports.defaultDayOfMonthOptionsWithOrdinal = exports.defaultDayOfMonthOptions = exports.weekOptions = exports.getPeriodOptionsWithHourDisabled = exports.getPeriodOptions = exports.generateOrdinalOptions = void 0;

var _utils = require("./utils");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var generateOrdinalOptions = function generateOrdinalOptions(start, end) {
  return (0, _utils.range)(start, end).map(function (day) {
    var customLabel = "".concat(day, "th");

    if (!(day.length > 1 && day.startsWith('1'))) {
      if (day.endsWith('1')) {
        customLabel = "".concat(day, "st");
      } else if (day.endsWith('2')) {
        customLabel = "".concat(day, "nd");
      } else if (day.endsWith('3')) {
        customLabel = "".concat(day, "rd");
      }
    } else if (day === '0') {
      customLabel = '0';
    }

    return {
      value: day,
      label: customLabel
    };
  });
};

exports.generateOrdinalOptions = generateOrdinalOptions;

var getPeriodOptions = function getPeriodOptions(periodOptionLabels) {
  return [{
    label: periodOptionLabels[0],
    value: 'hour'
  }, {
    label: periodOptionLabels[1],
    value: 'day'
  }, {
    label: periodOptionLabels[2],
    value: 'week'
  }, {
    label: periodOptionLabels[3],
    value: 'month'
  }, {
    label: periodOptionLabels[4],
    value: 'year'
  }];
};

exports.getPeriodOptions = getPeriodOptions;

var getPeriodOptionsWithHourDisabled = function getPeriodOptionsWithHourDisabled(periodOptionLabels) {
  return getPeriodOptions(periodOptionLabels).map(function (periodOption) {
    return periodOption.value === 'hour' ? _objectSpread(_objectSpread({}, periodOption), {}, {
      disabled: true
    }) : periodOption;
  });
};

exports.getPeriodOptionsWithHourDisabled = getPeriodOptionsWithHourDisabled;

var weekOptions = function weekOptions(weekDayLabels) {
  return weekDayLabels.map(function (day, idx) {
    return {
      value: "".concat(idx),
      label: day
    };
  });
};

exports.weekOptions = weekOptions;

var defaultDayOfMonthOptions = function defaultDayOfMonthOptions() {
  return (0, _utils.range)(1, 31).map(function (day) {
    return {
      value: "".concat(day),
      label: "".concat(day)
    };
  });
};

exports.defaultDayOfMonthOptions = defaultDayOfMonthOptions;

var defaultDayOfMonthOptionsWithOrdinal = function defaultDayOfMonthOptionsWithOrdinal() {
  return generateOrdinalOptions(1, 31);
};

exports.defaultDayOfMonthOptionsWithOrdinal = defaultDayOfMonthOptionsWithOrdinal;

var getLastDayOfMonthOption = function getLastDayOfMonthOption(lastDayOfMonthLabel) {
  return {
    value: 'L',
    label: lastDayOfMonthLabel
  };
};

exports.getLastDayOfMonthOption = getLastDayOfMonthOption;

var getDayOfMonthsOptionsWithL = function getDayOfMonthsOptionsWithL(lastDayOfMonthLabel) {
  return defaultDayOfMonthOptionsWithOrdinal().concat(getLastDayOfMonthOption(lastDayOfMonthLabel));
};

exports.getDayOfMonthsOptionsWithL = getDayOfMonthsOptionsWithL;
var DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD = defaultDayOfMonthOptionsWithOrdinal();
exports.DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD = DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD;
var DEFAULT_DAY_OF_MONTH_OPTS = defaultDayOfMonthOptions();
exports.DEFAULT_DAY_OF_MONTH_OPTS = DEFAULT_DAY_OF_MONTH_OPTS;

var getMonthOptions = function getMonthOptions(monthOptionLabels) {
  return monthOptionLabels.map(function (month, idx) {
    return {
      value: "".concat(idx + 1),
      label: month
    };
  });
};

exports.getMonthOptions = getMonthOptions;

var defaultHourOptionsHr = function defaultHourOptionsHr() {
  return (0, _utils.getTimesOfTheDayList)().map(function (time, idx) {
    return {
      value: "".concat(idx),
      label: time
    };
  });
};

exports.defaultHourOptionsHr = defaultHourOptionsHr;

var defaultHourOptions = function defaultHourOptions(type) {
  return (0, _utils.range)(0, 23).map(function (time) {
    return _objectSpread({
      value: "".concat(time),
      label: "".concat(time)
    }, time === '0' && type === 'every' && {
      disabled: true
    });
  });
};

exports.defaultHourOptions = defaultHourOptions;
var DEFAULT_HOUR_OPTS_AT = defaultHourOptions();
exports.DEFAULT_HOUR_OPTS_AT = DEFAULT_HOUR_OPTS_AT;
var DEFAULT_HOUR_OPTS_EVERY = defaultHourOptions('every');
exports.DEFAULT_HOUR_OPTS_EVERY = DEFAULT_HOUR_OPTS_EVERY;

var defaultMinuteOptions = function defaultMinuteOptions() {
  return (0, _utils.range)(0, 59).map(function (time) {
    return {
      value: "".concat(time),
      label: "".concat(time)
    };
  });
};

exports.defaultMinuteOptions = defaultMinuteOptions;

var defaultMinuteOptionsWithOrdinal = function defaultMinuteOptionsWithOrdinal() {
  return DEFAULT_MINUTE_OPTS;
};

exports.defaultMinuteOptionsWithOrdinal = defaultMinuteOptionsWithOrdinal;
var DEFAULT_MINUTE_OPTS = defaultMinuteOptions();
exports.DEFAULT_MINUTE_OPTS = DEFAULT_MINUTE_OPTS;

var atEveryOptions = function atEveryOptions(atLabel, everyLabel) {
  return [{
    value: 'at',
    label: atLabel
  }, {
    value: 'every',
    label: everyLabel
  }];
};

exports.atEveryOptions = atEveryOptions;

var everyOptionsNonAdmin = function everyOptionsNonAdmin(atLabel, everyLabel) {
  return [{
    value: 'at',
    label: atLabel,
    disabled: true
  }, {
    value: 'every',
    label: everyLabel
  }];
};

exports.everyOptionsNonAdmin = everyOptionsNonAdmin;

var atOptionsNonAdmin = function atOptionsNonAdmin(atLabel, everyLabel) {
  return [{
    value: 'at',
    label: atLabel
  }, {
    value: 'every',
    label: everyLabel,
    disabled: true
  }];
};

exports.atOptionsNonAdmin = atOptionsNonAdmin;

var onEveryOptions = function onEveryOptions(onLabel, everyLabel) {
  return [{
    value: 'on',
    label: onLabel
  }, {
    value: 'every',
    label: everyLabel
  }];
};

exports.onEveryOptions = onEveryOptions;