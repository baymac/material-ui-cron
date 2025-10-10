import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React from 'react';
import { useAtom, useAtomValue } from 'jotai';
import CustomSelect from '../components/CustomSelect';
import { getMonthOptions } from '../constants';
import { localeState, monthState } from '../store';

const StyledGridContainer = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '100px 1fr',
  gap: '16px',
  alignItems: 'center',
  padding: '8px 16px',
  margin: '8px 16px',
});

const StyledInTypography = styled(Typography)({
  textAlign: 'left',
});

export default function Month() {
  const [month, setMonth] = useAtom(monthState);
  const resolvedLocale = useAtomValue(localeState);
  const [monthOptions, setMonthOptions] = React.useState(
    getMonthOptions(resolvedLocale.shortMonthOptions),
  );

  return (
    <StyledGridContainer>
      <StyledInTypography>{resolvedLocale.inText}</StyledInTypography>
      <CustomSelect
        size='lg'
        options={monthOptions}
        label={resolvedLocale.monthLabel}
        value={month}
        setValue={setMonth}
        disableClearable
        sort
        disableEmpty
        limitTags={3}
      />
    </StyledGridContainer>
  );
}
