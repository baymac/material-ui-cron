"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = CustomSelect;

var _Chip = _interopRequireDefault(require("@material-ui/core/Chip"));

var _TextField = _interopRequireDefault(require("@material-ui/core/TextField"));

var _Autocomplete = _interopRequireDefault(require("@material-ui/core/Autocomplete"));

var _react = _interopRequireDefault(require("react"));

var _utils = require("../utils");

var _excluded = ["options", "value", "setValue", "label", "single", "sort", "disableEmpty", "disableClearable"];

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function CustomSelect(props) {
  var options = props.options,
      value = props.value,
      setValue = props.setValue,
      label = props.label,
      single = props.single,
      sort = props.sort,
      disableEmpty = props.disableEmpty,
      disableClearable = props.disableClearable,
      otherprops = _objectWithoutProperties(props, _excluded);

  var handleChange = function handleChange(event, newValue, reason) {
    if (reason === 'clear') {
      setValue([options[0]]);
    } else if (reason === 'selectOption' && single && props.multiple !== false) {
      var val = newValue.filter(function (val) {
        return val.label === event.target.childNodes[0].wholeText;
      });
      setValue(val);
    } else if (sort && reason === 'selectOption') {
      setValue((0, _utils.getSortedOptions)(newValue));
    } else if (reason !== 'removeOption') {
      setValue(newValue);
    } else if (reason === 'removeOption' && disableEmpty) {
      if (newValue.length !== 0) {
        setValue(newValue);
      }
    }
  };

  return _react["default"].createElement(_react["default"].Fragment, null, _react["default"].createElement(_Autocomplete["default"], _extends({
    multiple: true,
    options: options,
    value: value,
    onChange: handleChange,
    isOptionEqualToValue: function isOptionEqualToValue(option, val) {
      return option.value === val.value;
    },
    getOptionLabel: function getOptionLabel(option) {
      return option.label;
    },
    size: "small",
    forcePopupIcon: true,
    disableClearable: disableClearable,
    autoComplete: true,
    disableCloseOnSelect: !single,
    renderTags: function renderTags(value, getTagProps) {
      return value.map(function (option, index) {
        var disableSingleItemRemove = value.length === 1 && disableEmpty ? {
          onDelete: undefined
        } : {};
        return _react["default"].createElement(_Chip["default"], _extends({
          label: option.label,
          size: "small"
        }, getTagProps({
          index: index
        }), disableSingleItemRemove));
      });
    },
    getOptionDisabled: function getOptionDisabled(option) {
      return option.disabled ? true : false;
    },
    renderInput: function renderInput(params) {
      return _react["default"].createElement(_TextField["default"], _extends({}, params, {
        variant: "outlined",
        label: label
      }));
    }
  }, otherprops)));
}