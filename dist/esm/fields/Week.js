import { makeStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import Box from '@material-ui/core/Box';
import CustomSelect from '../components/CustomSelect';
import { weekOptions as defaultWeekOptions } from '../constants';
import { localeState, weekState } from '../store';
const useStyles = makeStyles({
  week: {
    minWidth: '300px',
    maxWidth: '500px',
    marginRight: '6px'
  },
  on: {
    margin: '8.5px 6px 0 0'
  }
});
export default function Week() {
  const classes = useStyles();
  const [week, setWeek] = useRecoilState(weekState);
  const resolvedLocale = useRecoilValue(localeState);
  const [weekOptions, setWeekOptions] = React.useState(defaultWeekOptions(resolvedLocale.weekDaysOptions));
  return React.createElement(Box, {
    display: "flex",
    p: 1,
    m: 1
  }, React.createElement(Typography, {
    classes: {
      root: classes.on
    }
  }, resolvedLocale.onText), React.createElement(CustomSelect, {
    options: weekOptions,
    label: resolvedLocale.dayOfWeekLabel,
    value: week,
    setValue: setWeek,
    disableClearable: true,
    sort: true,
    disableEmpty: true,
    classes: {
      root: clsx({
        [classes.week]: true
      })
    },
    limitTags: 3
  }));
}