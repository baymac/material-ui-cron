import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import cronstrue from 'cronstrue/i18n';
import React from 'react';
import { useAtomValue } from 'jotai';
import { cronExpState } from '../selector';
import { cronValidationErrorMessageState, localeState } from '../store';

const ErrorTypography = styled(Typography)({
  color: 'red',
});

const StyledBox = styled(Box)({
  display: 'flex',
  padding: '8px 16px',
  margin: '8px 16px',
});

export default function CronReader() {
  const cronExp = useAtomValue(cronExpState);
  const resolvedLocale = useAtomValue(localeState);

  const [cronHr, setCronHr] = React.useState('');

  const cronValidationErrorMessage = useAtomValue(cronValidationErrorMessageState);

  React.useEffect(() => {
    try {
      setCronHr(
        cronstrue.toString(cronExp, {
          locale: resolvedLocale.cronDescriptionText,
        }),
      );
    } catch (e) {
      setCronHr('Incorrect cron selection');
    }
  }, [cronExp, resolvedLocale.cronDescriptionText]);

  return (
    <StyledBox>
      {cronValidationErrorMessage.length === 0 && (
        <Typography variant='h6' style={{ color: '#382B5F' }}>
          {cronHr}
        </Typography>
      )}
      {cronValidationErrorMessage.length > 0 && (
        <ErrorTypography>{cronValidationErrorMessage}</ErrorTypography>
      )}
    </StyledBox>
  );
}
