function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import CustomSelect from '../components/CustomSelect';
import { atEveryOptions, atOptionsNonAdmin, defaultHourOptions, DEFAULT_HOUR_OPTS_AT, DEFAULT_HOUR_OPTS_EVERY } from '../constants';
import { hourAtEveryState, hourRangeEndSchedulerState, hourRangeStartSchedulerState, hourState, isAdminState, localeState } from '../store';
import { getTimesOfTheDay } from '../utils';
const POSSIBLE_TIME_RANGES = getTimesOfTheDay();
const useStyles = makeStyles({
  every: {
    minWidth: '100px',
    marginRight: '6px'
  },
  hour: {
    minWidth: '130px',
    maxWidth: '450px',
    marginRight: '6px'
  },
  betweenSelect: {
    minWidth: '130px',
    marginRight: '6px'
  },
  between: {
    margin: '8px 6px 0 0'
  }
});
export default function Hour() {
  const classes = useStyles();
  const [hourAtEvery, setHourAtEvery] = useRecoilState(hourAtEveryState);
  const [startHour, setStartHour] = useRecoilState(hourRangeStartSchedulerState);
  const [endHour, setEndHour] = useRecoilState(hourRangeEndSchedulerState);
  const [hour, setHour] = useRecoilState(hourState);
  const [hourOptions, setHourOptions] = React.useState(defaultHourOptions);
  const [possibleStartTimes, setPossibleStartTimes] = React.useState(POSSIBLE_TIME_RANGES);
  const [possibleEndTimes, setPossibleEndTimes] = React.useState(POSSIBLE_TIME_RANGES);
  React.useEffect(() => {
    const startIndex = possibleStartTimes.findIndex(x => x.value === startHour.value);
    const limitedPossibleTimeRange = possibleEndTimes.map((possibleEndTime, index) => _objectSpread(_objectSpread({}, possibleEndTime), {}, {
      disabled: index <= startIndex
    }));
    setPossibleEndTimes(limitedPossibleTimeRange);
  }, [startHour]);
  React.useEffect(() => {
    const endIndex = possibleEndTimes.findIndex(x => x.value === endHour.value);
    const limitedPossibleTimeRange = possibleStartTimes.map((possibleStartTime, index) => _objectSpread(_objectSpread({}, possibleStartTime), {}, {
      disabled: index >= endIndex
    }));
    setPossibleStartTimes(limitedPossibleTimeRange);
  }, [endHour]);
  const isAdmin = useRecoilValue(isAdminState);
  React.useEffect(() => {
    if (hourAtEvery.value === 'every') {
      if (hour.length > 1) {
        setHour([hourOptions[1]]);
      } else if (hour[0].value === '0') {
        setHour([hourOptions[1]]);
      }

      setHourOptions(DEFAULT_HOUR_OPTS_EVERY);
    } else {
      setHourOptions(DEFAULT_HOUR_OPTS_AT);
    }
  }, [hourAtEvery, isAdmin]);
  React.useEffect(() => {
    if (!isAdmin && hour.length > 1) {
      setHour(prevHour => [prevHour[0]]);
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
    value: hourAtEvery,
    setValue: setHourAtEvery,
    multiple: false,
    disableClearable: true,
    classes: {
      root: clsx({
        [classes.every]: true
      })
    }
  }), React.createElement(CustomSelect, {
    options: hourOptions,
    label: resolvedLocale.hourLabel,
    value: hour,
    setValue: setHour,
    single: hourAtEvery.value === 'every' || !isAdmin,
    sort: true,
    disableEmpty: true,
    limitTags: 3,
    disableClearable: hourAtEvery.value === 'every' || hour.length < 2,
    disabled: !isAdmin && hourAtEvery.value === 'every',
    classes: {
      root: clsx({
        [classes.hour]: true
      })
    }
  }), hourAtEvery.value === 'every' && React.createElement(React.Fragment, null, React.createElement(Typography, {
    classes: {
      root: classes.between
    }
  }, resolvedLocale.betweenText), React.createElement(CustomSelect, {
    single: true,
    options: possibleStartTimes,
    label: '',
    value: startHour,
    setValue: setStartHour,
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
    value: endHour,
    setValue: setEndHour,
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