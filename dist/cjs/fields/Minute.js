"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = Minute;

var _Box = _interopRequireDefault(require("@material-ui/core/Box"));

var _Typography = _interopRequireDefault(require("@material-ui/core/Typography"));

var _styles = require("@material-ui/styles");

var _clsx5 = _interopRequireDefault(require("clsx"));

var _react = _interopRequireDefault(require("react"));

var _recoil = require("recoil");

var _CustomSelect = _interopRequireDefault(require("../components/CustomSelect"));

var _constants = require("../constants");

var _store = require("../store");

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
  minute: {
    minWidth: '130px',
    maxWidth: '300px',
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

function Minute() {
  var classes = useStyles();

  var _useRecoilState = (0, _recoil.useRecoilState)(_store.minuteAtEveryState),
      _useRecoilState2 = _slicedToArray(_useRecoilState, 2),
      minuteAtEvery = _useRecoilState2[0],
      setMinuteAtEvery = _useRecoilState2[1];

  var _useRecoilState3 = (0, _recoil.useRecoilState)(_store.minuteRangeStartSchedulerState),
      _useRecoilState4 = _slicedToArray(_useRecoilState3, 2),
      startMinute = _useRecoilState4[0],
      setStartMinute = _useRecoilState4[1];

  var _useRecoilState5 = (0, _recoil.useRecoilState)(_store.minuteRangeEndSchedulerState),
      _useRecoilState6 = _slicedToArray(_useRecoilState5, 2),
      endMinute = _useRecoilState6[0],
      setEndMinute = _useRecoilState6[1];

  var _useRecoilState7 = (0, _recoil.useRecoilState)(_store.minuteState),
      _useRecoilState8 = _slicedToArray(_useRecoilState7, 2),
      minute = _useRecoilState8[0],
      setMinute = _useRecoilState8[1];

  var _React$useState = _react["default"].useState(_constants.DEFAULT_MINUTE_OPTS),
      _React$useState2 = _slicedToArray(_React$useState, 2),
      minuteOptions = _React$useState2[0],
      setMinuteOptions = _React$useState2[1];

  var _React$useState3 = _react["default"].useState((0, _constants.defaultMinuteOptionsWithOrdinal)()),
      _React$useState4 = _slicedToArray(_React$useState3, 2),
      possibleStartTimes = _React$useState4[0],
      setPossibleStartTimes = _React$useState4[1];

  var _React$useState5 = _react["default"].useState((0, _constants.defaultMinuteOptionsWithOrdinal)()),
      _React$useState6 = _slicedToArray(_React$useState5, 2),
      possibleEndTimes = _React$useState6[0],
      setPossibleEndTimes = _React$useState6[1];

  _react["default"].useEffect(function () {
    var startIndex = possibleStartTimes.findIndex(function (x) {
      return x.value === startMinute.value;
    });
    var limitedPossibleTimeRange = possibleEndTimes.map(function (possibleEndTime, index) {
      return _objectSpread(_objectSpread({}, possibleEndTime), {}, {
        disabled: index <= startIndex
      });
    });
    setPossibleEndTimes(limitedPossibleTimeRange);
  }, [startMinute]);

  _react["default"].useEffect(function () {
    var endIndex = possibleEndTimes.findIndex(function (x) {
      return x.value === endMinute.value;
    });
    var limitedPossibleTimeRange = possibleStartTimes.map(function (possibleStartTime, index) {
      return _objectSpread(_objectSpread({}, possibleStartTime), {}, {
        disabled: index >= endIndex
      });
    });
    setPossibleStartTimes(limitedPossibleTimeRange);
  }, [endMinute]);

  var isAdmin = (0, _recoil.useRecoilValue)(_store.isAdminState);

  _react["default"].useEffect(function () {
    if (minuteAtEvery.value === 'every') {
      if (minute.length > 1) {
        setMinute([minuteOptions[1]]);
      } else if (minute[0].value === '0') {
        setMinute([minuteOptions[1]]);
      }

      setMinuteOptions(function (prevMinuteOptions) {
        return prevMinuteOptions.map(function (prevMinuteOption) {
          return _objectSpread(_objectSpread({}, prevMinuteOption), prevMinuteOption.value === '0' && {
            disabled: true
          });
        });
      });
    } else {
      setMinuteOptions(_constants.defaultMinuteOptions);
    }
  }, [minuteAtEvery, isAdmin]);

  _react["default"].useEffect(function () {
    if (!isAdmin && minute.length > 1) {
      setMinute(function (prevMinute) {
        return [prevMinute[0]];
      });
    }
  }, [isAdmin]);

  var resolvedLocale = (0, _recoil.useRecoilValue)(_store.localeState);
  return _react["default"].createElement(_Box["default"], {
    display: "flex",
    p: 1,
    m: 1
  }, _react["default"].createElement(_CustomSelect["default"], {
    single: true,
    options: isAdmin ? (0, _constants.atEveryOptions)(resolvedLocale.atOptionLabel, resolvedLocale.everyOptionLabel) : (0, _constants.atOptionsNonAdmin)(resolvedLocale.atOptionLabel, resolvedLocale.everyOptionLabel),
    label: resolvedLocale.atEveryText,
    disableClearable: true,
    value: minuteAtEvery,
    setValue: setMinuteAtEvery,
    multiple: false,
    classes: {
      root: (0, _clsx5["default"])(_defineProperty({}, classes.every, true))
    }
  }), _react["default"].createElement(_CustomSelect["default"], {
    options: minuteOptions,
    label: resolvedLocale.minuteLabel,
    value: minute,
    setValue: setMinute,
    disableClearable: minuteAtEvery.value === 'every' || minute.length < 2,
    single: minuteAtEvery.value === 'every' || !isAdmin,
    sort: true,
    disableEmpty: true,
    disabled: minuteAtEvery.value === 'every' && !isAdmin,
    classes: {
      root: (0, _clsx5["default"])(_defineProperty({}, classes.minute, true))
    },
    limitTags: 3
  }), minuteAtEvery.value === 'every' && _react["default"].createElement(_react["default"].Fragment, null, _react["default"].createElement(_Typography["default"], {
    classes: {
      root: classes.between
    }
  }, resolvedLocale.betweenText), _react["default"].createElement(_CustomSelect["default"], {
    single: true,
    options: possibleStartTimes,
    label: '',
    value: startMinute,
    setValue: setStartMinute,
    multiple: false,
    disableClearable: true,
    classes: {
      root: (0, _clsx5["default"])(_defineProperty({}, classes.betweenSelect, true))
    },
    disabled: !isAdmin
  }), _react["default"].createElement(_Typography["default"], {
    classes: {
      root: classes.between
    }
  }, resolvedLocale.andText), _react["default"].createElement(_CustomSelect["default"], {
    single: true,
    options: possibleEndTimes,
    label: '',
    value: endMinute,
    setValue: setEndMinute,
    multiple: false,
    disableClearable: true,
    classes: {
      root: (0, _clsx5["default"])(_defineProperty({}, classes.betweenSelect, true))
    },
    disabled: !isAdmin
  })));
}