import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useRecoilState, useRecoilValue } from 'recoil';
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
  const [period, setPeriod] = useRecoilState(periodState);

  const isAdmin = useRecoilValue(isAdminState);

  const resolvedLocale = useRecoilValue(localeState);

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
