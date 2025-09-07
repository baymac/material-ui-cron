import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import { useRecoilState, useRecoilValue } from 'recoil'
import CustomSelect from '../components/CustomSelect'
import {
  getPeriodOptions,
  getPeriodOptionsWithHourDisabled,
} from '../constants'
import { isAdminState, localeState, periodState } from '../store'

const StyledPeriodSelect = styled(CustomSelect)({
  minWidth: '200px',
  maxWidth: '350px',
  marginRight: '6px',
})

const StyledEveryTypography = styled(Typography)({
  margin: '8.5px 6px 0 0',
})

export default function Period() {
  const [period, setPeriod] = useRecoilState(periodState)

  const isAdmin = useRecoilValue(isAdminState)

  const resolvedLocale = useRecoilValue(localeState)

  return (
    <Box display='flex' p={1} m={1}>
      <StyledEveryTypography>
        {resolvedLocale.everyText}
      </StyledEveryTypography>
      <StyledPeriodSelect
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
    </Box>
  )
}
