"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = Scheduler;

var _Box = _interopRequireDefault(require("@material-ui/core/Box"));

var _styles = require("@material-ui/styles");

var _react = _interopRequireDefault(require("react"));

var _recoil = require("recoil");

var _CronExp = _interopRequireDefault(require("./components/CronExp"));

var _CronReader = _interopRequireDefault(require("./components/CronReader"));

var _DayOfMonth = _interopRequireDefault(require("./fields/DayOfMonth"));

var _Hour = _interopRequireDefault(require("./fields/Hour"));

var _Minute = _interopRequireDefault(require("./fields/Minute"));

var _Month = _interopRequireDefault(require("./fields/Month"));

var _Period = _interopRequireDefault(require("./fields/Period"));

var _Week = _interopRequireDefault(require("./fields/Week"));

var _i18n = require("./i18n");

var _selector = require("./selector");

var _store = require("./store");

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var useStyles = (0, _styles.makeStyles)({
  box: {
    minHeight: 'min-content'
  }
});

function Scheduler(props) {
  var cron = props.cron,
      setCron = props.setCron,
      setCronError = props.setCronError,
      isAdmin = props.isAdmin,
      locale = props.locale,
      customLocale = props.customLocale;
  var classes = useStyles();
  var period = (0, _recoil.useRecoilValue)(_store.periodState);

  var _React$useState = _react["default"].useState(0),
      _React$useState2 = _slicedToArray(_React$useState, 2),
      periodIndex = _React$useState2[0],
      setPeriodIndex = _React$useState2[1];

  var setCronExp = (0, _recoil.useSetRecoilState)(_selector.cronExpState);
  var cronError = (0, _recoil.useRecoilValue)(_store.cronValidationErrorMessageState);
  var setIsAdmin = (0, _recoil.useSetRecoilState)(_store.isAdminState);

  var _useRecoilState = (0, _recoil.useRecoilState)(_store.cronExpInputState),
      _useRecoilState2 = _slicedToArray(_useRecoilState, 2),
      cronExpInput = _useRecoilState2[0],
      setCronExpInput = _useRecoilState2[1];

  var setResolvedLocale = (0, _recoil.useSetRecoilState)(_store.localeState);
  var resetCronExpInput = (0, _recoil.useResetRecoilState)(_store.cronExpInputState);
  var resetMinute = (0, _recoil.useResetRecoilState)(_store.minuteState);
  var resetHour = (0, _recoil.useResetRecoilState)(_store.hourState);
  var resetDayOfMonth = (0, _recoil.useResetRecoilState)(_store.dayOfMonthState);
  var resetDayOfWeek = (0, _recoil.useResetRecoilState)(_store.weekState);
  var resetMonth = (0, _recoil.useResetRecoilState)(_store.monthState);
  var resetPeriod = (0, _recoil.useResetRecoilState)(_store.periodState);

  _react["default"].useEffect(function () {
    setCronError(cronError);
  }, [cronError]);

  _react["default"].useEffect(function () {
    setPeriodIndex((0, _utils.getPeriodIndex)(period));
  }, [period]);

  _react["default"].useEffect(function () {
    setCron(cronExpInput);
  }, [cronExpInput]);

  _react["default"].useEffect(function () {
    if (isAdmin) {
      setIsAdmin(isAdmin);
    } else {
      setIsAdmin(false);
    }
  }, [isAdmin]);

  _react["default"].useEffect(function () {
    setCronExpInput(cron);
    return function () {
      setCronExp('0 0 * * 1-5');
      resetCronExpInput();
      resetMinute();
      resetHour();
      resetDayOfMonth();
      resetDayOfWeek();
      resetMonth();
      resetPeriod();
    };
  }, []);

  _react["default"].useEffect(function () {
    if (customLocale) {
      setResolvedLocale(customLocale);
    } else if (locale) {
      setResolvedLocale(_i18n.supportedLanguages[locale]);
    } else {
      setResolvedLocale(_i18n.supportedLanguages['en']);
    }
  }, [locale, customLocale]);

  return _react["default"].createElement(_react["default"].Fragment, null, _react["default"].createElement(_Box["default"], {
    display: "flex",
    flexDirection: "column",
    className: classes.box
  }, _react["default"].createElement(_Period["default"], null), periodIndex > 3 && _react["default"].createElement(_Month["default"], null), periodIndex > 2 && _react["default"].createElement(_DayOfMonth["default"], null), periodIndex > 1 && _react["default"].createElement(_Week["default"], null), periodIndex > 0 && _react["default"].createElement(_Hour["default"], null), _react["default"].createElement(_Minute["default"], null), _react["default"].createElement(_CronExp["default"], null), _react["default"].createElement(_CronReader["default"], null)));
}