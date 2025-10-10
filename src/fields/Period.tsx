import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useAtom, useAtomValue } from 'jotai';
import CustomSelect from '../components/CustomSelect';
import { getPeriodOptions, getPeriodOptionsWithHourDisabled } from '../constants';
import { isAdminState, localeState, periodState } from '../store';

const StyledGridContainer = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '100px 1fr',
  gap: '16px',
  alignItems: 'center',
  padding: '8px 16px',
  margin: '8px 16px',
});

const StyledEveryTypography = styled(Typography)({
  textAlign: 'left',
});

export default function Period() {
  const [period, setPeriod] = useAtom(periodState);

  const isAdmin = useAtomValue(isAdminState);

  const resolvedLocale = useAtomValue(localeState);

  return (
    <StyledGridContainer>
      <StyledEveryTypography>{resolvedLocale.everyText}</StyledEveryTypography>
      <CustomSelect
        size='lg'
        single
        disableClearable
        options={
          isAdmin
            ? getPeriodOptions(resolvedLocale.periodOptions)
            : getPeriodOptionsWithHourDisabled(resolvedLocale.periodOptions)
        }
        label={resolvedLocale.periodLabel}
        value={period}
        setValue={setPeriod}
        multiple={false}
      />
    </StyledGridContainer>
  );
}
