"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = Week;

var _styles = require("@material-ui/styles");

var _Typography = _interopRequireDefault(require("@material-ui/core/Typography"));

var _clsx2 = _interopRequireDefault(require("clsx"));

var _react = _interopRequireDefault(require("react"));

var _recoil = require("recoil");

var _Box = _interopRequireDefault(require("@material-ui/core/Box"));

var _CustomSelect = _interopRequireDefault(require("../components/CustomSelect"));

var _constants = require("../constants");

var _store = require("../store");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var useStyles = (0, _styles.makeStyles)({
  week: {
    minWidth: '300px',
    maxWidth: '500px',
    marginRight: '6px'
  },
  on: {
    margin: '8.5px 6px 0 0'
  }
});

function Week() {
  var classes = useStyles();

  var _useRecoilState = (0, _recoil.useRecoilState)(_store.weekState),
      _useRecoilState2 = _slicedToArray(_useRecoilState, 2),
      week = _useRecoilState2[0],
      setWeek = _useRecoilState2[1];

  var resolvedLocale = (0, _recoil.useRecoilValue)(_store.localeState);

  var _React$useState = _react["default"].useState((0, _constants.weekOptions)(resolvedLocale.weekDaysOptions)),
      _React$useState2 = _slicedToArray(_React$useState, 2),
      weekOptions = _React$useState2[0],
      setWeekOptions = _React$useState2[1];

  return _react["default"].createElement(_Box["default"], {
    display: "flex",
    p: 1,
    m: 1
  }, _react["default"].createElement(_Typography["default"], {
    classes: {
      root: classes.on
    }
  }, resolvedLocale.onText), _react["default"].createElement(_CustomSelect["default"], {
    options: weekOptions,
    label: resolvedLocale.dayOfWeekLabel,
    value: week,
    setValue: setWeek,
    disableClearable: true,
    sort: true,
    disableEmpty: true,
    classes: {
      root: (0, _clsx2["default"])(_defineProperty({}, classes.week, true))
    },
    limitTags: 3
  }));
}