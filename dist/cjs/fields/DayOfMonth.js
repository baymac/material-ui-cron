"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = DayOfMonth;

var _Box = _interopRequireDefault(require("@material-ui/core/Box"));

var _Typography = _interopRequireDefault(require("@material-ui/core/Typography"));

var _styles = require("@material-ui/styles");

var _clsx5 = _interopRequireDefault(require("clsx"));

var _react = _interopRequireDefault(require("react"));

var _recoil = require("recoil");

var _CustomSelect = _interopRequireDefault(require("../components/CustomSelect"));

var _constants = require("../constants");

var _store = require("../store");

var _utils = require("../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var useStyles = (0, _styles.makeStyles)({
  every: {
    minWidth: '100px',
    marginRight: '6px'
  },
  dayOfMonth: {
    minWidth: '200px',
    maxWidth: '350px',
    marginRight: '6px'
  },
  days: {
    minWidth: '120px',
    maxWidth: '120px',
    marginRight: '6px'
  },
  betweenSelect: {
    minWidth: '90px',
    maxWidth: '90px',
    marginRight: '6px'
  },
  between: {
    margin: '8px 6px 0 0'
  }
});

function DayOfMonth() {
  var _clsx2;

  var classes = useStyles();
  var resolvedLocale = (0, _recoil.useRecoilValue)(_store.localeState);

  var _useRecoilState = (0, _recoil.useRecoilState)(_store.dayOfMonthAtEveryState),
      _useRecoilState2 = _slicedToArray(_useRecoilState, 2),
      dayOfMonthAtEvery = _useRecoilState2[0],
      setDayOfMonthAtEvery = _useRecoilState2[1];

  var _useRecoilState3 = (0, _recoil.useRecoilState)(_store.dayOfMonthRangeStartSchedulerState),
      _useRecoilState4 = _slicedToArray(_useRecoilState3, 2),
      startMonth = _useRecoilState4[0],
      setStartMonth = _useRecoilState4[1];

  var _useRecoilState5 = (0, _recoil.useRecoilState)(_store.dayOfMonthRangeEndSchedulerState),
      _useRecoilState6 = _slicedToArray(_useRecoilState5, 2),
      endMonth = _useRecoilState6[0],
      setEndMonth = _useRecoilState6[1];

  var _useRecoilState7 = (0, _recoil.useRecoilState)(_store.dayOfMonthState),
      _useRecoilState8 = _slicedToArray(_useRecoilState7, 2),
      dayOfMonth = _useRecoilState8[0],
      setDayOfMonth = _useRecoilState8[1];

  var _React$useState = _react["default"].useState((0, _constants.getDayOfMonthsOptionsWithL)(resolvedLocale.lastDayOfMonthLabel)),
      _React$useState2 = _slicedToArray(_React$useState, 2),
      dayOfMonthOptions = _React$useState2[0],
      setDayOfMonthOptions = _React$useState2[1];

  var _React$useState3 = _react["default"].useState(_constants.DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD),
      _React$useState4 = _slicedToArray(_React$useState3, 2),
      possibleStartDays = _React$useState4[0],
      setPossibleStartDays = _React$useState4[1];

  var _React$useState5 = _react["default"].useState(_constants.DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD),
      _React$useState6 = _slicedToArray(_React$useState5, 2),
      possibleEndDays = _React$useState6[0],
      setPossibleEndDays = _React$useState6[1];

  _react["default"].useEffect(function () {
    var startIndex = possibleStartDays.findIndex(function (x) {
      return x.value === startMonth.value;
    });
    var limitedPossibleTimeRange = possibleEndDays.map(function (possibleEndTime, index) {
      return _objectSpread(_objectSpread({}, possibleEndTime), {}, {
        disabled: index <= startIndex
      });
    });
    setPossibleEndDays(limitedPossibleTimeRange);
  }, [startMonth]);

  _react["default"].useEffect(function () {
    var endIndex = possibleEndDays.findIndex(function (x) {
      return x.value === endMonth.value;
    });
    var limitedPossibleTimeRange = possibleStartDays.map(function (possibleStartTime, index) {
      return _objectSpread(_objectSpread({}, possibleStartTime), {}, {
        disabled: index >= endIndex
      });
    });
    setPossibleStartDays(limitedPossibleTimeRange);
  }, [endMonth]);

  _react["default"].useEffect(function () {
    if (dayOfMonthAtEvery.value === 'every') {
      if (dayOfMonth.length > 1) {
        setDayOfMonth([_constants.DEFAULT_DAY_OF_MONTH_OPTS[0]]);
      } else if (dayOfMonth[0].value === 'L') {
        setDayOfMonth([_constants.DEFAULT_DAY_OF_MONTH_OPTS[0]]);
      }

      setDayOfMonthOptions(_constants.DEFAULT_DAY_OF_MONTH_OPTS);
    } else {
      setDayOfMonthOptions((0, _constants.getDayOfMonthsOptionsWithL)(resolvedLocale.lastDayOfMonthLabel));
    }
  }, [dayOfMonthAtEvery]);

  var handleChange = function handleChange(newOptions) {
    if (dayOfMonthAtEvery.value === 'on') {
      if ((0, _utils.getIndex)((0, _constants.getLastDayOfMonthOption)(resolvedLocale.lastDayOfMonthLabel), newOptions) === 0) {
        setDayOfMonth(newOptions.filter(function (option) {
          return option.value !== 'L';
        }));
      } else if ((0, _utils.getIndex)((0, _constants.getLastDayOfMonthOption)(resolvedLocale.lastDayOfMonthLabel), newOptions) > 0) {
        setDayOfMonth([(0, _constants.getLastDayOfMonthOption)(resolvedLocale.lastDayOfMonthLabel)]);
      } else {
        setDayOfMonth(newOptions);
      }
    } else {
      setDayOfMonth(newOptions);
    }
  };

  return _react["default"].createElement(_Box["default"], {
    display: "flex",
    p: 1,
    m: 1
  }, _react["default"].createElement(_CustomSelect["default"], {
    single: true,
    options: (0, _constants.onEveryOptions)(resolvedLocale.onOptionLabel, resolvedLocale.everyOptionLabel),
    label: resolvedLocale.onEveryText,
    value: dayOfMonthAtEvery,
    setValue: setDayOfMonthAtEvery,
    multiple: false,
    disableClearable: true,
    classes: {
      root: (0, _clsx5["default"])(_defineProperty({}, classes.every, true))
    }
  }), _react["default"].createElement(_CustomSelect["default"], {
    options: dayOfMonthOptions,
    label: dayOfMonthAtEvery.value === 'on' ? resolvedLocale.multiDayOfMonthLabel : resolvedLocale.dayOfMonthLabel,
    value: dayOfMonth,
    setValue: handleChange,
    single: dayOfMonthAtEvery.value === 'every',
    sort: true,
    disableEmpty: true,
    limitTags: 3,
    disableClearable: dayOfMonthAtEvery.value === 'every' || dayOfMonth.length < 2,
    classes: {
      root: (0, _clsx5["default"])((_clsx2 = {}, _defineProperty(_clsx2, classes.dayOfMonth, dayOfMonthAtEvery.value === 'on'), _defineProperty(_clsx2, classes.days, dayOfMonthAtEvery.value === 'every'), _clsx2))
    }
  }), dayOfMonthAtEvery.value === 'every' && _react["default"].createElement(_react["default"].Fragment, null, _react["default"].createElement(_Typography["default"], {
    classes: {
      root: classes.between
    }
  }, resolvedLocale.betweenText), _react["default"].createElement(_CustomSelect["default"], {
    single: true,
    options: possibleStartDays,
    label: '',
    value: startMonth,
    setValue: setStartMonth,
    multiple: false,
    disableClearable: true,
    classes: {
      root: (0, _clsx5["default"])(_defineProperty({}, classes.betweenSelect, true))
    }
  }), _react["default"].createElement(_Typography["default"], {
    classes: {
      root: classes.between
    }
  }, resolvedLocale.andText), _react["default"].createElement(_CustomSelect["default"], {
    single: true,
    options: possibleEndDays,
    label: '',
    value: endMonth,
    setValue: setEndMonth,
    multiple: false,
    disableClearable: true,
    classes: {
      root: (0, _clsx5["default"])(_defineProperty({}, classes.betweenSelect, true))
    }
  })));
}