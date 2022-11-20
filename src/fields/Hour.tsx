import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import CustomSelect from '../components/CustomSelect'
import {
  atEveryOptions,
  atOptionsNonAdmin,
  defaultHourOptions,
  DEFAULT_HOUR_OPTS_AT,
  DEFAULT_HOUR_OPTS_EVERY,
} from '../constants'
import {
  hourAtEveryState,
  hourRangeEndSchedulerState,
  hourRangeStartSchedulerState,
  hourState,
  isAdminState,
  localeState,
} from '../store'
import { getTimesOfTheDay } from '../utils'

const POSSIBLE_TIME_RANGES = getTimesOfTheDay()

export default function Hour() {
  const [hourAtEvery, setHourAtEvery] = useRecoilState(hourAtEveryState)
  const [startHour, setStartHour] = useRecoilState(hourRangeStartSchedulerState)
  const [endHour, setEndHour] = useRecoilState(hourRangeEndSchedulerState)
  const [hour, setHour] = useRecoilState(hourState)
  const [hourOptions, setHourOptions] = React.useState(defaultHourOptions)

  const [possibleStartTimes, setPossibleStartTimes] =
    React.useState(POSSIBLE_TIME_RANGES)

  const [possibleEndTimes, setPossibleEndTimes] =
    React.useState(POSSIBLE_TIME_RANGES)

  React.useEffect(() => {
    const startIndex = possibleStartTimes.findIndex(
      (x) => x.value === startHour.value
    )
    const limitedPossibleTimeRange = possibleEndTimes.map(
      (possibleEndTime, index) => ({
        ...possibleEndTime,
        disabled: index <= startIndex,
      })
    )
    setPossibleEndTimes(limitedPossibleTimeRange)
  }, [startHour])

  React.useEffect(() => {
    const endIndex = possibleEndTimes.findIndex(
      (x) => x.value === endHour.value
    )
    const limitedPossibleTimeRange = possibleStartTimes.map(
      (possibleStartTime, index) => ({
        ...possibleStartTime,
        disabled: index >= endIndex,
      })
    )
    setPossibleStartTimes(limitedPossibleTimeRange)
  }, [endHour])

  const isAdmin = useRecoilValue(isAdminState)

  React.useEffect(() => {
    if (hourAtEvery.value === 'every') {
      if (hour.length > 1) {
        setHour([hourOptions[1]])
      } else if (hour[0].value === '0') {
        setHour([hourOptions[1]])
      }
      setHourOptions(DEFAULT_HOUR_OPTS_EVERY)
    } else {
      setHourOptions(DEFAULT_HOUR_OPTS_AT)
    }
  }, [hourAtEvery, isAdmin])

  React.useEffect(() => {
    if (!isAdmin && hour.length > 1) {
      setHour((prevHour) => [prevHour[0]])
    }
  }, [isAdmin])

  const resolvedLocale = useRecoilValue(localeState)

  return (
    <Box display='flex' p={1} m={1}>
      <CustomSelect
        single
        options={
          isAdmin
            ? atEveryOptions(
                resolvedLocale.atOptionLabel,
                resolvedLocale.everyOptionLabel
              )
            : atOptionsNonAdmin(
                resolvedLocale.atOptionLabel,
                resolvedLocale.everyOptionLabel
              )
        }
        label={resolvedLocale.atEveryText}
        value={hourAtEvery}
        setValue={setHourAtEvery}
        disableClearable
        sx={{
          minWidth: 100,
          mr: 1,
        }}
      />
      <CustomSelect
        options={hourOptions}
        label={resolvedLocale.hourLabel}
        value={hour}
        setValue={setHour}
        single={hourAtEvery.value === 'every' || !isAdmin}
        sort
        disableEmpty
        multiple
        limitTags={3}
        disableClearable={hourAtEvery.value === 'every' || hour.length < 2}
        disabled={!isAdmin && hourAtEvery.value === 'every'}
        sx={{
          minWidth: 130,
          maxWidth: 450,
          mr: 1,
        }}
      />
      {hourAtEvery.value === 'every' && (
        <>
          <Typography sx={{ margin: '8px 6px 0 0' }}>
            {resolvedLocale.betweenText}
          </Typography>
          <CustomSelect
            single
            options={possibleStartTimes}
            value={startHour}
            setValue={setStartHour}
            disableClearable
            sx={{
              minWidth: 130,
              mr: 1,
            }}
            disabled={!isAdmin}
          />
          <Typography sx={{ margin: '8px 6px 0 0' }}>
            {resolvedLocale.andText}
          </Typography>
          <CustomSelect
            single
            options={possibleEndTimes}
            value={endHour}
            setValue={setEndHour}
            disableClearable
            sx={{
              minWidth: 130,
              mr: 1,
            }}
            disabled={!isAdmin}
          />
        </>
      )}
    </Box>
  )
}
