import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import CustomSelect from '../components/CustomSelect'
import { weekOptions as defaultWeekOptions } from '../constants'
import { localeState, weekState } from '../store'

const StyledWeekSelect = styled(CustomSelect)({
  minWidth: '200px',
  maxWidth: '350px',
  marginRight: '6px',
})

const StyledOnTypography = styled(Typography)({
  margin: '8.5px 6px 0 0',
})

export default function Week() {
  const [week, setWeek] = useRecoilState(weekState)
  const resolvedLocale = useRecoilValue(localeState)
  const [weekOptions, setWeekOptions] = React.useState(
    defaultWeekOptions(resolvedLocale.weekDaysOptions)
  )

  return (
    <Box display='flex' p={1} m={1}>
      <StyledOnTypography>
        {resolvedLocale.onText}
      </StyledOnTypography>
      <StyledWeekSelect
        options={weekOptions}
        label="Week Days"
        value={week}
        setValue={setWeek}
        multiple
        sort
        disableEmpty
        limitTags={3}
        disableClearable={week.length < 2}
      />
    </Box>
  )
}
