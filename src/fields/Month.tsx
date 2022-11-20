import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import CustomSelect from '../components/CustomSelect'
import { getMonthOptions } from '../constants'
import { localeState, monthState } from '../store'

export default function Month() {
  const [month, setMonth] = useRecoilState(monthState)
  const resolvedLocale = useRecoilValue(localeState)
  const [monthOptions] = React.useState(
    getMonthOptions(resolvedLocale.shortMonthOptions)
  )

  return (
    <Box display='flex' p={1} m={1}>
      <Typography sx={{ margin: '8.5px 6px 0 0' }}>
        {resolvedLocale.inText}
      </Typography>
      <CustomSelect
        options={monthOptions}
        label={resolvedLocale.monthLabel}
        value={month}
        setValue={setMonth}
        disableClearable
        sort
        disableEmpty
        multiple
        sx={{
          minWidth: 300,
          maxWidth: 500,
          mr: 1,
        }}
        limitTags={3}
      />
    </Box>
  )
}
