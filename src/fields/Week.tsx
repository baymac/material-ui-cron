import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import CustomSelect from '../components/CustomSelect'
import { weekOptions as defaultWeekOptions } from '../constants'
import { localeState, weekState } from '../store'


const StyledGridContainer = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '100px 1fr',
  gap: '16px',
  alignItems: 'center',
  padding: '8px 16px',
  margin: '8px 16px',
})

const StyledOnTypography = styled(Typography)({
  textAlign: 'left',
})

export default function Week() {
  const [week, setWeek] = useRecoilState(weekState)
  const resolvedLocale = useRecoilValue(localeState)
  const [weekOptions, setWeekOptions] = React.useState(
    defaultWeekOptions(resolvedLocale.weekDaysOptions)
  )

  return (
    <StyledGridContainer>
      <StyledOnTypography>
        {resolvedLocale.onText}
      </StyledOnTypography>
      <CustomSelect
        size="lg"
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
    </StyledGridContainer>
  )
}
