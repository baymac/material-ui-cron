import Typography from '@mui/material/Typography'
import React from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import Box from '@mui/material/Box'
import CustomSelect from '../components/CustomSelect'
import { weekOptions as defaultWeekOptions } from '../constants'
import { localeState, weekState } from '../store'

export default function Week() {
  const [week, setWeek] = useRecoilState(weekState)
  const resolvedLocale = useRecoilValue(localeState)
  const [weekOptions] = React.useState(
    defaultWeekOptions(resolvedLocale.weekDaysOptions)
  )

  return (
    <Box display='flex' p={1} m={1}>
      <Typography sx={{ margin: '8.5px 6px 0 0' }}>
        {resolvedLocale.onText}
      </Typography>
      <CustomSelect
        options={weekOptions}
        label={resolvedLocale.dayOfWeekLabel}
        value={week}
        setValue={setWeek}
        disableClearable
        sort
        disableEmpty
        multiple
        sx={{
          minWidth: 300,
          maxWidth: 500,
          mr: 6,
        }}
        limitTags={3}
      />
    </Box>
  )
}
