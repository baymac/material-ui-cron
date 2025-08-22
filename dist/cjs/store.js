"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cronExpInputState = exports.isAdminState = exports.cronValidationErrorMessageState = exports.monthState = exports.weekState = exports.dayOfMonthRangeEndSchedulerState = exports.dayOfMonthRangeStartSchedulerState = exports.dayOfMonthState = exports.dayOfMonthAtEveryState = exports.hourRangeEndSchedulerState = exports.hourRangeStartSchedulerState = exports.hourAtEveryState = exports.hourState = exports.minuteRangeEndSchedulerState = exports.minuteRangeStartSchedulerState = exports.minuteAtEveryState = exports.minuteState = exports.periodState = exports.localeState = void 0;

var _recoil = require("recoil");

var _constants = require("./constants");

var _enLocale = _interopRequireDefault(require("./localization/enLocale"));

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var localeState = (0, _recoil.atom)({
  key: 'localeState',
  "default": _enLocale["default"]
});
exports.localeState = localeState;
var periodState = (0, _recoil.atom)({
  key: 'periodState',
  "default": (0, _recoil.selector)({
    key: 'periodStateDefaultSelector',
    get: function get(_ref) {
      var _get = _ref.get;

      var resolvedLocale = _get(localeState);

      return (0, _constants.getPeriodOptions)(resolvedLocale.periodOptions)[1];
    }
  })
});
exports.periodState = periodState;
var minuteState = (0, _recoil.atom)({
  key: 'minuteState',
  "default": [_constants.DEFAULT_MINUTE_OPTS[0]]
});
exports.minuteState = minuteState;
var minuteAtEveryState = (0, _recoil.atom)({
  key: 'minuteAtEveryState',
  "default": (0, _recoil.selector)({
    key: 'minuteAtEveryStateDefaultSelector',
    get: function get(_ref2) {
      var _get2 = _ref2.get;

      var resolvedLocale = _get2(localeState);

      return (0, _constants.atEveryOptions)(resolvedLocale.atOptionLabel, resolvedLocale.everyOptionLabel)[0];
    }
  })
});
exports.minuteAtEveryState = minuteAtEveryState;
var minuteRangeStartSchedulerState = (0, _recoil.atom)({
  key: 'minuteRangeStartSchedulerState',
  "default": (0, _constants.defaultMinuteOptionsWithOrdinal)()[0]
});
exports.minuteRangeStartSchedulerState = minuteRangeStartSchedulerState;
var minuteRangeEndSchedulerState = (0, _recoil.atom)({
  key: 'minuteRangeEndSchedulerState',
  "default": (0, _constants.defaultMinuteOptionsWithOrdinal)()[59]
});
exports.minuteRangeEndSchedulerState = minuteRangeEndSchedulerState;
var hourState = (0, _recoil.atom)({
  key: 'hourState',
  "default": [_constants.DEFAULT_HOUR_OPTS_EVERY[0]]
});
exports.hourState = hourState;
var hourAtEveryState = (0, _recoil.atom)({
  key: 'hourAtEveryState',
  "default": (0, _recoil.selector)({
    key: 'hourAtEveryStateDefaultSelector',
    get: function get(_ref3) {
      var _get3 = _ref3.get;

      var resolvedLocale = _get3(localeState);

      return (0, _constants.atEveryOptions)(resolvedLocale.atOptionLabel, resolvedLocale.everyOptionLabel)[0];
    }
  })
});
exports.hourAtEveryState = hourAtEveryState;
var hourRangeStartSchedulerState = (0, _recoil.atom)({
  key: 'hourRangeStartSchedulerState',
  "default": (0, _utils.getTimesOfTheDay)()[0]
});
exports.hourRangeStartSchedulerState = hourRangeStartSchedulerState;
var hourRangeEndSchedulerState = (0, _recoil.atom)({
  key: 'hourRangeEndSchedulerState',
  "default": (0, _utils.getTimesOfTheDay)()[23]
});
exports.hourRangeEndSchedulerState = hourRangeEndSchedulerState;
var dayOfMonthAtEveryState = (0, _recoil.atom)({
  key: 'dayOfMonthAtEveryState',
  "default": (0, _recoil.selector)({
    key: 'dayOfMonthAtEveryStateDefaultSelector',
    get: function get(_ref4) {
      var _get4 = _ref4.get;

      var resolvedLocale = _get4(localeState);

      console.log(resolvedLocale);
      return (0, _constants.onEveryOptions)(resolvedLocale.onOptionLabel, resolvedLocale.everyOptionLabel)[0];
    }
  })
});
exports.dayOfMonthAtEveryState = dayOfMonthAtEveryState;
var dayOfMonthState = (0, _recoil.atom)({
  key: 'dayOfMonthState',
  "default": _constants.DEFAULT_DAY_OF_MONTH_OPTS
});
exports.dayOfMonthState = dayOfMonthState;
var dayOfMonthRangeStartSchedulerState = (0, _recoil.atom)({
  key: 'dayOfMonthRangeStartSchedulerState',
  "default": _constants.DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD[0]
});
exports.dayOfMonthRangeStartSchedulerState = dayOfMonthRangeStartSchedulerState;
var dayOfMonthRangeEndSchedulerState = (0, _recoil.atom)({
  key: 'dayOfMonthRangeEndSchedulerState',
  "default": _constants.DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD[30]
});
exports.dayOfMonthRangeEndSchedulerState = dayOfMonthRangeEndSchedulerState;
var weekState = (0, _recoil.atom)({
  key: 'weekState',
  "default": (0, _recoil.selector)({
    key: 'weekStateDefaultSelector',
    get: function get(_ref5) {
      var _get5 = _ref5.get;

      var resolvedLocale = _get5(localeState);

      return (0, _constants.weekOptions)(resolvedLocale.weekDaysOptions);
    }
  })
});
exports.weekState = weekState;
var monthState = (0, _recoil.atom)({
  key: 'monthState',
  "default": (0, _recoil.selector)({
    key: 'monthStateDefaultSelector',
    get: function get(_ref6) {
      var _get6 = _ref6.get;

      var resolvedLocale = _get6(localeState);

      return (0, _constants.getMonthOptions)(resolvedLocale.shortMonthOptions);
    }
  })
});
exports.monthState = monthState;
var cronValidationErrorMessageState = (0, _recoil.atom)({
  key: 'cronValidationErrorMessageState',
  "default": ''
});
exports.cronValidationErrorMessageState = cronValidationErrorMessageState;
var isAdminState = (0, _recoil.atom)({
  key: 'isAdminState',
  "default": true
});
exports.isAdminState = isAdminState;
var cronExpInputState = (0, _recoil.atom)({
  key: 'cronExpInputState',
  "default": '0 0 * * *'
});
exports.cronExpInputState = cronExpInputState;