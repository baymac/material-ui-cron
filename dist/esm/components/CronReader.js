import { makeStyles, createStyles } from '@material-ui/styles';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import cronstrue from 'cronstrue/i18n';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { cronExpState } from '../selector';
import { cronValidationErrorMessageState, localeState } from '../store';
const useStyles = makeStyles(() => createStyles({
  error: {
    color: 'red'
  }
}));
export default function CronReader() {
  const classes = useStyles();
  const cronExp = useRecoilValue(cronExpState);
  const resolvedLocale = useRecoilValue(localeState);
  const [cronHr, setCronHr] = React.useState('');
  const cronValidationErrorMessage = useRecoilValue(cronValidationErrorMessageState);
  React.useEffect(() => {
    try {
      setCronHr(cronstrue.toString(cronExp, {
        locale: resolvedLocale.cronDescriptionText
      }));
    } catch (e) {
      setCronHr('Incorrect cron selection');
    }
  }, [cronExp]);
  return React.createElement(Box, {
    display: "flex",
    p: 1,
    m: 1
  }, cronValidationErrorMessage.length === 0 && React.createElement(Typography, {
    variant: "h6",
    style: {
      color: '#382B5F'
    }
  }, cronHr), cronValidationErrorMessage.length > 0 && React.createElement(Typography, {
    className: classes.error
  }, cronValidationErrorMessage));
}