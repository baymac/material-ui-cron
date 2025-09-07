import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import React from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import CustomSelect from '../components/CustomSelect'
import { getMonthOptions } from '../constants'
import { localeState, monthState } from '../store'

const StyledMonthSelect = styled(CustomSelect)({
  minWidth: '200px',
  maxWidth: '350px',
  marginRight: '6px',
})

const StyledInTypography = styled(Typography)({
  margin: '8.5px 6px 0 0',
})

export default function Month() {
  const [month, setMonth] = useRecoilState(monthState)
  const resolvedLocale = useRecoilValue(localeState)
  const [monthOptions, setMonthOptions] = React.useState(
    getMonthOptions(resolvedLocale.shortMonthOptions)
  )

  return (
    <Box display='flex' p={1} m={1}>
      <StyledInTypography>
        {resolvedLocale.inText}
      </StyledInTypography>
      <StyledMonthSelect
        options={monthOptions}
        label={resolvedLocale.monthLabel}
        value={month}
        setValue={setMonth}
        disableClearable
        sort
        disableEmpty
        limitTags={3}
      />
    </Box>
  )
}
