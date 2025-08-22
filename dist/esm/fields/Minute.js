function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/styles';
import clsx from 'clsx';
import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import CustomSelect from '../components/CustomSelect';
import { atEveryOptions, atOptionsNonAdmin, defaultMinuteOptions, defaultMinuteOptionsWithOrdinal, DEFAULT_MINUTE_OPTS } from '../constants';
import { isAdminState, localeState, minuteAtEveryState, minuteRangeEndSchedulerState, minuteRangeStartSchedulerState, minuteState } from '../store';
const useStyles = makeStyles({
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
export default function Minute() {
  const classes = useStyles();
  const [minuteAtEvery, setMinuteAtEvery] = useRecoilState(minuteAtEveryState);
  const [startMinute, setStartMinute] = useRecoilState(minuteRangeStartSchedulerState);
  const [endMinute, setEndMinute] = useRecoilState(minuteRangeEndSchedulerState);
  const [minute, setMinute] = useRecoilState(minuteState);
  const [minuteOptions, setMinuteOptions] = React.useState(DEFAULT_MINUTE_OPTS);
  const [possibleStartTimes, setPossibleStartTimes] = React.useState(defaultMinuteOptionsWithOrdinal());
  const [possibleEndTimes, setPossibleEndTimes] = React.useState(defaultMinuteOptionsWithOrdinal());
  React.useEffect(() => {
    const startIndex = possibleStartTimes.findIndex(x => x.value === startMinute.value);
    const limitedPossibleTimeRange = possibleEndTimes.map((possibleEndTime, index) => _objectSpread(_objectSpread({}, possibleEndTime), {}, {
      disabled: index <= startIndex
    }));
    setPossibleEndTimes(limitedPossibleTimeRange);
  }, [startMinute]);
  React.useEffect(() => {
    const endIndex = possibleEndTimes.findIndex(x => x.value === endMinute.value);
    const limitedPossibleTimeRange = possibleStartTimes.map((possibleStartTime, index) => _objectSpread(_objectSpread({}, possibleStartTime), {}, {
      disabled: index >= endIndex
    }));
    setPossibleStartTimes(limitedPossibleTimeRange);
  }, [endMinute]);
  const isAdmin = useRecoilValue(isAdminState);
  React.useEffect(() => {
    if (minuteAtEvery.value === 'every') {
      if (minute.length > 1) {
        setMinute([minuteOptions[1]]);
      } else if (minute[0].value === '0') {
        setMinute([minuteOptions[1]]);
      }

      setMinuteOptions(prevMinuteOptions => prevMinuteOptions.map(prevMinuteOption => _objectSpread(_objectSpread({}, prevMinuteOption), prevMinuteOption.value === '0' && {
        disabled: true
      })));
    } else {
      setMinuteOptions(defaultMinuteOptions);
    }
  }, [minuteAtEvery, isAdmin]);
  React.useEffect(() => {
    if (!isAdmin && minute.length > 1) {
      setMinute(prevMinute => [prevMinute[0]]);
    }
  }, [isAdmin]);
  const resolvedLocale = useRecoilValue(localeState);
  return React.createElement(Box, {
    display: "flex",
    p: 1,
    m: 1
  }, React.createElement(CustomSelect, {
    single: true,
    options: isAdmin ? atEveryOptions(resolvedLocale.atOptionLabel, resolvedLocale.everyOptionLabel) : atOptionsNonAdmin(resolvedLocale.atOptionLabel, resolvedLocale.everyOptionLabel),
    label: resolvedLocale.atEveryText,
    disableClearable: true,
    value: minuteAtEvery,
    setValue: setMinuteAtEvery,
    multiple: false,
    classes: {
      root: clsx({
        [classes.every]: true
      })
    }
  }), React.createElement(CustomSelect, {
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
      root: clsx({
        [classes.minute]: true
      })
    },
    limitTags: 3
  }), minuteAtEvery.value === 'every' && React.createElement(React.Fragment, null, React.createElement(Typography, {
    classes: {
      root: classes.between
    }
  }, resolvedLocale.betweenText), React.createElement(CustomSelect, {
    single: true,
    options: possibleStartTimes,
    label: '',
    value: startMinute,
    setValue: setStartMinute,
    multiple: false,
    disableClearable: true,
    classes: {
      root: clsx({
        [classes.betweenSelect]: true
      })
    },
    disabled: !isAdmin
  }), React.createElement(Typography, {
    classes: {
      root: classes.between
    }
  }, resolvedLocale.andText), React.createElement(CustomSelect, {
    single: true,
    options: possibleEndTimes,
    label: '',
    value: endMinute,
    setValue: setEndMinute,
    multiple: false,
    disableClearable: true,
    classes: {
      root: clsx({
        [classes.betweenSelect]: true
      })
    },
    disabled: !isAdmin
  })));
}