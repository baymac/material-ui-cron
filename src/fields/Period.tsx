import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import CustomSelect from '../components/CustomSelect'
import {
  getPeriodOptions,
  getPeriodOptionsWithHourDisabled,
} from '../constants'
import { isAdminState, localeState, periodState, variantState } from '../store'

export default function Period() {
  const [period, setPeriod] = useRecoilState(periodState)

  const isAdmin = useRecoilValue(isAdminState)

  const resolvedLocale = useRecoilValue(localeState)

  const variant = useRecoilValue(variantState)

  return (
    <Box display='flex' p={1} m={1}>
      <Typography
        sx={{
          margin: (variant === 'standard' ? 'auto' : '8.5px') + ' 6px 0 0',
        }}
      >
        {resolvedLocale.everyText}
      </Typography>
      <CustomSelect
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
        sx={{
          minWidth: 200,
          marginRight: '6px',
          maxWidth: 200,
        }}
      />
    </Box>
  )
}
