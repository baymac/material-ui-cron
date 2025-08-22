"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = CronReader;

var _styles = require("@material-ui/styles");

var _Box = _interopRequireDefault(require("@material-ui/core/Box"));

var _Typography = _interopRequireDefault(require("@material-ui/core/Typography"));

var _i18n = _interopRequireDefault(require("cronstrue/i18n"));

var _react = _interopRequireDefault(require("react"));

var _recoil = require("recoil");

var _selector = require("../selector");

var _store = require("../store");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var useStyles = (0, _styles.makeStyles)(function () {
  return (0, _styles.createStyles)({
    error: {
      color: 'red'
    }
  });
});

function CronReader() {
  var classes = useStyles();
  var cronExp = (0, _recoil.useRecoilValue)(_selector.cronExpState);
  var resolvedLocale = (0, _recoil.useRecoilValue)(_store.localeState);

  var _React$useState = _react["default"].useState(''),
      _React$useState2 = _slicedToArray(_React$useState, 2),
      cronHr = _React$useState2[0],
      setCronHr = _React$useState2[1];

  var cronValidationErrorMessage = (0, _recoil.useRecoilValue)(_store.cronValidationErrorMessageState);

  _react["default"].useEffect(function () {
    try {
      setCronHr(_i18n["default"].toString(cronExp, {
        locale: resolvedLocale.cronDescriptionText
      }));
    } catch (e) {
      setCronHr('Incorrect cron selection');
    }
  }, [cronExp]);

  return _react["default"].createElement(_Box["default"], {
    display: "flex",
    p: 1,
    m: 1
  }, cronValidationErrorMessage.length === 0 && _react["default"].createElement(_Typography["default"], {
    variant: "h6",
    style: {
      color: '#382B5F'
    }
  }, cronHr), cronValidationErrorMessage.length > 0 && _react["default"].createElement(_Typography["default"], {
    className: classes.error
  }, cronValidationErrorMessage));
}