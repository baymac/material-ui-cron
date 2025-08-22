"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = CronExp;

var _Box = _interopRequireDefault(require("@material-ui/core/Box"));

var _styles = require("@material-ui/styles");

var _TextField = _interopRequireDefault(require("@material-ui/core/TextField"));

var _react = _interopRequireDefault(require("react"));

var _recoil = require("recoil");

var _useDebounce = _interopRequireDefault(require("../hooks/useDebounce"));

var _selector = require("../selector");

var _store = require("../store");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var useStyles = (0, _styles.makeStyles)({
  cron: {
    marginRight: '6px',
    backgroundColor: '#382B5F',
    color: 'white',
    '& input:focus + fieldset': {
      borderWidth: 0,
      borderColor: '#382B5F'
    }
  },
  input: {
    minWidth: '100px',
    maxWidth: '200px',
    color: 'white',
    wordSpacing: '5px'
  },
  label: {
    color: 'white'
  }
});

function CronExp() {
  var classes = useStyles();
  var isAdmin = (0, _recoil.useRecoilValue)(_store.isAdminState);

  var _useRecoilState = (0, _recoil.useRecoilState)(_selector.cronExpState),
      _useRecoilState2 = _slicedToArray(_useRecoilState, 2),
      cronExp = _useRecoilState2[0],
      setCronExp = _useRecoilState2[1];

  var _useRecoilState3 = (0, _recoil.useRecoilState)(_store.cronExpInputState),
      _useRecoilState4 = _slicedToArray(_useRecoilState3, 2),
      cronExpInput = _useRecoilState4[0],
      setCronExpInput = _useRecoilState4[1];

  var debouncedCronExpInput = (0, _useDebounce["default"])(cronExpInput, 500);

  _react["default"].useEffect(function () {
    setCronExpInput(cronExp);
  }, [cronExp]);

  _react["default"].useEffect(function () {
    if (debouncedCronExpInput) {
      setCronExp(cronExpInput);
    }
  }, [debouncedCronExpInput]);

  return _react["default"].createElement(_Box["default"], {
    display: "flex",
    p: 1,
    m: 1
  }, _react["default"].createElement(_TextField["default"], {
    variant: "outlined",
    value: cronExpInput,
    onBlur: function onBlur(event) {
      setCronExpInput(event.target.value);
    },
    label: "",
    className: classes.cron,
    InputProps: {
      classes: {
        input: classes.input
      }
    },
    InputLabelProps: {
      classes: {
        root: classes.label
      }
    },
    disabled: !isAdmin
  }));
}