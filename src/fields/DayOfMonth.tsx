import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import CustomSelect from '../components/CustomSelect'
import {
  DEFAULT_DAY_OF_MONTH_OPTS,
  DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD,
  getDayOfMonthsOptionsWithL,
  getLastDayOfMonthOption,
  onEveryOptions,
} from '../constants'
import {
  dayOfMonthAtEveryState,
  dayOfMonthRangeEndSchedulerState,
  dayOfMonthRangeStartSchedulerState,
  dayOfMonthState,
  localeState,
} from '../store'
import { SelectOptions } from '../types'
import { getIndex } from '../utils'

export default function DayOfMonth() {
  const resolvedLocale = useRecoilValue(localeState)

  const [dayOfMonthAtEvery, setDayOfMonthAtEvery] = useRecoilState(
    dayOfMonthAtEveryState
  )
  const [startMonth, setStartMonth] = useRecoilState(
    dayOfMonthRangeStartSchedulerState
  )
  const [endMonth, setEndMonth] = useRecoilState(
    dayOfMonthRangeEndSchedulerState
  )
  const [dayOfMonth, setDayOfMonth] = useRecoilState(dayOfMonthState)
  const [dayOfMonthOptions, setDayOfMonthOptions] = React.useState(
    getDayOfMonthsOptionsWithL(resolvedLocale.lastDayOfMonthLabel)
  )

  const [possibleStartDays, setPossibleStartDays] = React.useState(
    DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD
  )

  const [possibleEndDays, setPossibleEndDays] = React.useState(
    DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD
  )

  React.useEffect(() => {
    const startIndex = possibleStartDays.findIndex(
      (x) => x.value === startMonth.value
    )
    const limitedPossibleTimeRange = possibleEndDays.map(
      (possibleEndTime, index) => ({
        ...possibleEndTime,
        disabled: index <= startIndex,
      })
    )
    setPossibleEndDays(limitedPossibleTimeRange)
  }, [startMonth])

  React.useEffect(() => {
    const endIndex = possibleEndDays.findIndex(
      (x) => x.value === endMonth.value
    )
    const limitedPossibleTimeRange = possibleStartDays.map(
      (possibleStartTime, index) => ({
        ...possibleStartTime,
        disabled: index >= endIndex,
      })
    )
    setPossibleStartDays(limitedPossibleTimeRange)
  }, [endMonth])

  React.useEffect(() => {
    if (dayOfMonthAtEvery.value === 'every') {
      if (dayOfMonth.length > 1) {
        setDayOfMonth([DEFAULT_DAY_OF_MONTH_OPTS[0]])
      } else if (dayOfMonth[0].value === 'L') {
        setDayOfMonth([DEFAULT_DAY_OF_MONTH_OPTS[0]])
      }
      setDayOfMonthOptions(DEFAULT_DAY_OF_MONTH_OPTS)
    } else {
      setDayOfMonthOptions(
        getDayOfMonthsOptionsWithL(resolvedLocale.lastDayOfMonthLabel)
      )
    }
  }, [dayOfMonthAtEvery])

  const handleChange = (newOptions: SelectOptions[]) => {
    if (dayOfMonthAtEvery.value === 'on') {
      if (
        getIndex(
          getLastDayOfMonthOption(resolvedLocale.lastDayOfMonthLabel),
          newOptions
        ) === 0
      ) {
        setDayOfMonth(newOptions.filter((option) => option.value !== 'L'))
      } else if (
        getIndex(
          getLastDayOfMonthOption(resolvedLocale.lastDayOfMonthLabel),
          newOptions
        ) > 0
      ) {
        setDayOfMonth([
          getLastDayOfMonthOption(resolvedLocale.lastDayOfMonthLabel),
        ])
      } else {
        setDayOfMonth(newOptions)
      }
    } else {
      setDayOfMonth(newOptions)
    }
  }

  return (
    <Box display='flex' p={1} m={1}>
      <CustomSelect
        single
        options={onEveryOptions(
          resolvedLocale.onOptionLabel,
          resolvedLocale.everyOptionLabel
        )}
        label={resolvedLocale.onEveryText}
        value={dayOfMonthAtEvery}
        setValue={setDayOfMonthAtEvery}
        disableClearable
        sx={{
          minWidth: 100,
          mr: 1,
        }}
      />
      <CustomSelect
        options={dayOfMonthOptions}
        label={
          dayOfMonthAtEvery.value === 'on'
            ? resolvedLocale.multiDayOfMonthLabel
            : resolvedLocale.dayOfMonthLabel
        }
        value={dayOfMonth}
        setValue={handleChange}
        single={dayOfMonthAtEvery.value === 'every'}
        multiple
        sort
        disableEmpty
        limitTags={3}
        disableClearable={
          dayOfMonthAtEvery.value === 'every' || dayOfMonth.length < 2
        }
        sx={{
          minWidth: dayOfMonthAtEvery.value === 'on' ? 200 : 120,
          maxWidth: dayOfMonthAtEvery.value === 'on' ? 200 : 120,
          mr: 1,
        }}
      />
      {dayOfMonthAtEvery.value === 'every' && (
        <>
          <Typography sx={{ margin: '8px 6px 0 0' }}>
            {resolvedLocale.betweenText}
          </Typography>
          <CustomSelect
            single
            options={possibleStartDays}
            label={''}
            value={startMonth}
            setValue={setStartMonth}
            disableClearable
            sx={{
              minWidth: 90,
              maxWidth: 90,
              mr: 1,
            }}
          />
          <Typography sx={{ margin: '8px 6px 0 0' }}>
            {resolvedLocale.andText}
          </Typography>
          <CustomSelect
            single
            options={possibleEndDays}
            label={''}
            value={endMonth}
            setValue={setEndMonth}
            disableClearable
            sx={{
              minWidth: 90,
              maxWidth: 90,
              mr: 1,
            }}
          />
        </>
      )}
    </Box>
  )
}
