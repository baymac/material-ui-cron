import { makeStyles } from '@material-ui/styles'
import Typography from '@material-ui/core/Typography'
import clsx from 'clsx'
import React from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import Box from '@material-ui/core/Box'
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
  minuteAtEveryState,
  minuteRangeEndSchedulerState,
  minuteRangeStartSchedulerState,
  minuteState,
} from '../store'

const useStyles = makeStyles({
  every: {
    minWidth: '100px',
    marginRight: '6px',
  },
  minute: {
    minWidth: '130px',
    maxWidth: '300px',
    marginRight: '6px',
  },
  betweenSelect: {
    minWidth: '90px',
    maxWidth: '90px',
    marginRight: '6px',
  },
  between: {
    margin: '8px 6px 0 0',
  },
})

export default function Minute() {
  const classes = useStyles()
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

  return (
    <Box display='flex' p={1} m={1}>
      <CustomSelect
        options={isAdmin ? atEveryOptions : atOptionsNonAdmin}
        label={'At/Every'}
        disableClearable
        value={minuteAtEvery}
        setValue={setMinuteAtEvery}
        multiple={false}
        classes={{
          root: clsx({
            [classes.every]: true,
          }),
        }}
      />
      <CustomSelect
        options={minuteOptions}
        label={'Minute(s)'}
        value={minute}
        setValue={setMinute}
        disableClearable={minuteAtEvery.value === 'every' || minute.length < 2}
        single={minuteAtEvery.value === 'every' || !isAdmin}
        sort
        disableEmpty
        disabled={minuteAtEvery.value === 'every' && !isAdmin}
        classes={{
          root: clsx({
            [classes.minute]: true,
          }),
        }}
        limitTags={3}
      />
      {minuteAtEvery.value === 'every' && (
        <>
          <Typography classes={{ root: classes.between }}>between</Typography>
          <CustomSelect
            options={possibleStartTimes}
            label={''}
            value={startMinute}
            setValue={setStartMinute}
            multiple={false}
            disableClearable
            classes={{
              root: clsx({
                [classes.betweenSelect]: true,
              }),
            }}
            disabled={!isAdmin}
          />
          <Typography classes={{ root: classes.between }}>and</Typography>
          <CustomSelect
            options={possibleEndTimes}
            label={''}
            value={endMinute}
            setValue={setEndMinute}
            multiple={false}
            disableClearable
            classes={{
              root: clsx({
                [classes.betweenSelect]: true,
              }),
            }}
            disabled={!isAdmin}
          />
        </>
      )}
    </Box>
  )
}
