import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import CustomSelect from '../components/CustomSelect'
import {
  atEveryOptions,
  atOptionsNonAdmin,
  DEFAULT_HOUR_OPTS_AT,
  DEFAULT_HOUR_OPTS_EVERY,
  defaultHourOptions,
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

const StyledEverySelect = styled(CustomSelect)({
  minWidth: '100px',
  marginRight: '6px',
})

const StyledHourSelect = styled(CustomSelect)({
  minWidth: '130px',
  maxWidth: '450px',
  marginRight: '6px',
})

const StyledBetweenSelect = styled(CustomSelect)({
  minWidth: '130px',
  marginRight: '6px',
})

const StyledBetweenTypography = styled(Typography)({
  margin: '8px 6px 0 0',
})

export default function Hour() {
  const [hourAtEvery, setHourAtEvery] = useRecoilState(hourAtEveryState)
  const [startHour, setStartHour] = useRecoilState(hourRangeStartSchedulerState)
  const [endHour, setEndHour] = useRecoilState(hourRangeEndSchedulerState)
  const [hour, setHour] = useRecoilState(hourState)
  const [hourOptions, setHourOptions] = React.useState(defaultHourOptions)

  const [possibleStartTimes, setPossibleStartTimes] = React.useState(
    POSSIBLE_TIME_RANGES
  )

  const [possibleEndTimes, setPossibleEndTimes] = React.useState(
    POSSIBLE_TIME_RANGES
  )

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
      <StyledEverySelect
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
        multiple={false}
        disableClearable
      />
      <StyledHourSelect
        options={hourOptions}
        label={resolvedLocale.hourLabel}
        value={hour}
        setValue={setHour}
        single={hourAtEvery.value === 'every' || !isAdmin}
        sort
        disableEmpty
        limitTags={3}
        disableClearable={hourAtEvery.value === 'every' || hour.length < 2}
        disabled={!isAdmin && hourAtEvery.value === 'every'}
      />
      {hourAtEvery.value === 'every' && (
        <>
          <StyledBetweenTypography>
            {resolvedLocale.betweenText}
          </StyledBetweenTypography>
          <StyledBetweenSelect
            single
            options={possibleStartTimes}
            label={''}
            value={startHour}
            setValue={setStartHour}
            multiple={false}
            disableClearable
            disabled={!isAdmin}
          />
          <StyledBetweenTypography>
            {resolvedLocale.andText}
          </StyledBetweenTypography>
          <StyledBetweenSelect
            single
            options={possibleEndTimes}
            label={''}
            value={endHour}
            setValue={setEndHour}
            multiple={false}
            disableClearable
            disabled={!isAdmin}
          />
        </>
      )}
    </Box>
  )
}
