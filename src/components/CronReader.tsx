import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import cronstrue from 'cronstrue/i18n';
import React from 'react';
import { useAtomValue } from 'jotai';
import { cronExpState } from '../selector';
import { cronValidationErrorMessageState, localeState } from '../store';

const ErrorTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
}));

const SummaryTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 600,
}));

const StyledBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 16px',
  minHeight: 28,
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
        <SummaryTypography variant='subtitle1'>{cronHr}</SummaryTypography>
      )}
      {cronValidationErrorMessage.length > 0 && (
        <ErrorTypography>{cronValidationErrorMessage}</ErrorTypography>
      )}
    </StyledBox>
  );
}
