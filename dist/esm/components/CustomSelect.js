const _excluded = ["options", "value", "setValue", "label", "single", "sort", "disableEmpty", "disableClearable"];

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

import Chip from '@material-ui/core/Chip';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/core/Autocomplete';
import React from 'react';
import { getSortedOptions } from '../utils';
export default function CustomSelect(props) {
  const {
    options,
    value,
    setValue,
    label,
    single,
    sort,
    disableEmpty,
    disableClearable
  } = props,
        otherprops = _objectWithoutProperties(props, _excluded);

  const handleChange = (event, newValue, reason) => {
    if (reason === 'clear') {
      setValue([options[0]]);
    } else if (reason === 'selectOption' && single && props.multiple !== false) {
      const val = newValue.filter(val => val.label === event.target.childNodes[0].wholeText);
      setValue(val);
    } else if (sort && reason === 'selectOption') {
      setValue(getSortedOptions(newValue));
    } else if (reason !== 'removeOption') {
      setValue(newValue);
    } else if (reason === 'removeOption' && disableEmpty) {
      if (newValue.length !== 0) {
        setValue(newValue);
      }
    }
  };

  return React.createElement(React.Fragment, null, React.createElement(Autocomplete, _extends({
    multiple: true,
    options: options,
    value: value,
    onChange: handleChange,
    isOptionEqualToValue: (option, val) => option.value === val.value,
    getOptionLabel: option => option.label,
    size: "small",
    forcePopupIcon: true,
    disableClearable: disableClearable,
    autoComplete: true,
    disableCloseOnSelect: !single,
    renderTags: (value, getTagProps) => value.map((option, index) => {
      const disableSingleItemRemove = value.length === 1 && disableEmpty ? {
        onDelete: undefined
      } : {};
      return React.createElement(Chip, _extends({
        label: option.label,
        size: "small"
      }, getTagProps({
        index
      }), disableSingleItemRemove));
    }),
    getOptionDisabled: option => option.disabled ? true : false,
    renderInput: params => {
      return React.createElement(TextField, _extends({}, params, {
        variant: "outlined",
        label: label
      }));
    }
  }, otherprops)));
}