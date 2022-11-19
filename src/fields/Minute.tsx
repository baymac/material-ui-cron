import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import CustomSelect from '../components/CustomSelect'
import {
  atEveryOptions,
  atOptionsNonAdmin,
  defaultMinuteOptions,
  defaultMinuteOptionsWithOrdinal,
  DEFAULT_MINUTE_OPTS,
} from '../constants'
import {
  isAdminState,
  localeState,
  minuteAtEveryState,
  minuteRangeEndSchedulerState,
  minuteRangeStartSchedulerState,
  minuteState,
} from '../store'

export default function Minute() {
  const [minuteAtEvery, setMinuteAtEvery] = useRecoilState(minuteAtEveryState)
  const [startMinute, setStartMinute] = useRecoilState(
    minuteRangeStartSchedulerState
  )
  const [endMinute, setEndMinute] = useRecoilState(minuteRangeEndSchedulerState)
  const [minute, setMinute] = useRecoilState(minuteState)
  const [minuteOptions, setMinuteOptions] = React.useState(DEFAULT_MINUTE_OPTS)

  const [possibleStartTimes, setPossibleStartTimes] = React.useState(
    defaultMinuteOptionsWithOrdinal()
  )

  const [possibleEndTimes, setPossibleEndTimes] = React.useState(
    defaultMinuteOptionsWithOrdinal()
  )

  React.useEffect(() => {
    const startIndex = possibleStartTimes.findIndex(
      (x) => x.value === startMinute.value
    )
    const limitedPossibleTimeRange = possibleEndTimes.map(
      (possibleEndTime, index) => ({
        ...possibleEndTime,
        disabled: index <= startIndex,
      })
    )
    setPossibleEndTimes(limitedPossibleTimeRange)
  }, [startMinute])

  React.useEffect(() => {
    const endIndex = possibleEndTimes.findIndex(
      (x) => x.value === endMinute.value
    )
    const limitedPossibleTimeRange = possibleStartTimes.map(
      (possibleStartTime, index) => ({
        ...possibleStartTime,
        disabled: index >= endIndex,
      })
    )
    setPossibleStartTimes(limitedPossibleTimeRange)
  }, [endMinute])

  const isAdmin = useRecoilValue(isAdminState)

  React.useEffect(() => {
    if (minuteAtEvery.value === 'every') {
      if (minute.length > 1) {
        setMinute([minuteOptions[1]])
      } else if (minute[0].value === '0') {
        setMinute([minuteOptions[1]])
      }
      setMinuteOptions((prevMinuteOptions) =>
        prevMinuteOptions.map((prevMinuteOption) => ({
          ...prevMinuteOption,
          ...(prevMinuteOption.value === '0' && { disabled: true }),
        }))
      )
    } else {
      setMinuteOptions(defaultMinuteOptions)
    }
  }, [minuteAtEvery, isAdmin])

  React.useEffect(() => {
    if (!isAdmin && minute.length > 1) {
      setMinute((prevMinute) => [prevMinute[0]])
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
        disableClearable
        value={minuteAtEvery}
        setValue={setMinuteAtEvery}
        sx={{
          minWidth: 100,
          mr: 1,
        }}
      />
      <CustomSelect
        options={minuteOptions}
        label={resolvedLocale.minuteLabel}
        value={minute}
        setValue={setMinute}
        disableClearable={minuteAtEvery.value === 'every' || minute.length < 2}
        single={minuteAtEvery.value === 'every' || !isAdmin}
        sort
        disableEmpty
        multiple
        disabled={minuteAtEvery.value === 'every' && !isAdmin}
        sx={{
          minWidth: 130,
          maxWidth: 300,
          mr: 1,
        }}
        limitTags={3}
      />
      {minuteAtEvery.value === 'every' && (
        <>
          <Typography sx={{ margin: '8px 6px 0 0' }}>
            {resolvedLocale.betweenText}
          </Typography>
          <CustomSelect
            single
            options={possibleStartTimes}
            label={''}
            value={startMinute}
            setValue={setStartMinute}
            disableClearable
            sx={{
              minWidth: 90,
              maxWidth: 90,
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
            label={''}
            value={endMinute}
            setValue={setEndMinute}
            disableClearable
            sx={{
              minWidth: 90,
              maxWidth: 90,
              mr: 1,
            }}
            disabled={!isAdmin}
          />
        </>
      )}
    </Box>
  )
}
