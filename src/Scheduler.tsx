import Box from '@material-ui/core/Box'
import { makeStyles } from '@material-ui/styles'
import Typography from '@material-ui/core/Typography'
import React from 'react'
import {
  useRecoilState,
  useRecoilValue,
  useResetRecoilState,
  useSetRecoilState,
} from 'recoil'
import CronExp from './components/CronExp'
import CronReader from './components/CronReader'
import DayOfMonth from './fields/DayOfMonth'
import Hour from './fields/Hour'
import Minute from './fields/Minute'
import Month from './fields/Month'
import Period from './fields/Period'
import Week from './fields/Week'
import { cronExpState } from './selector'
import {
  cronExpInputState,
  cronValidationErrorMessageState,
  dayOfMonthState,
  hourState,
  isAdminState,
  minuteState,
  monthState,
  periodState,
  weekState,
} from './store'
import { SchedulerProps } from './types'
import { getPeriodIndex } from './utils'

const useStyles = makeStyles({
  box: {
    minHeight: 'min-content',
  },
})

export default function Scheduler(props: SchedulerProps) {
  const { cron, setCron, setCronError, isAdmin } = props
  const classes = useStyles()
  const period = useRecoilValue(periodState)
  const [periodIndex, setPeriodIndex] = React.useState(0)

  const setCronExp = useSetRecoilState(cronExpState)

  const cronError = useRecoilValue(cronValidationErrorMessageState)
  const setIsAdmin = useSetRecoilState(isAdminState)

  const [cronExpInput, setCronExpInput] = useRecoilState(cronExpInputState)

  const resetCronExpInput = useResetRecoilState(cronExpInputState)
  const resetMinute = useResetRecoilState(minuteState)
  const resetHour = useResetRecoilState(hourState)
  const resetDayOfMonth = useResetRecoilState(dayOfMonthState)
  const resetDayOfWeek = useResetRecoilState(weekState)
  const resetMonth = useResetRecoilState(monthState)
  const resetPeriod = useResetRecoilState(periodState)

  React.useEffect(() => {
    setCronError(cronError)
  }, [cronError])

  React.useEffect(() => {
    setPeriodIndex(getPeriodIndex(period))
  }, [period])

  React.useEffect(() => {
    setCron(cronExpInput)
  }, [cronExpInput])

  React.useEffect(() => {
    if (isAdmin) {
      setIsAdmin(isAdmin)
    } else {
      setIsAdmin(false)
    }
  }, [isAdmin])

  React.useEffect(() => {
    setCronExpInput(cron)
    return () => {
      setCronExp('0 0 * * 1-5')
      resetCronExpInput()
      resetMinute()
      resetHour()
      resetDayOfMonth()
      resetDayOfWeek()
      resetMonth()
      resetPeriod()
    }
  }, [])

  return (
    <>
      <Box display='flex' flexDirection='column' className={classes.box}>
        <Period />
        {periodIndex > 3 && <Month />}
        {periodIndex > 2 && <DayOfMonth />}
        {periodIndex > 1 && <Week />}
        {periodIndex > 0 && <Hour />}
        <Minute />
        <CronExp />
        <CronReader />
      </Box>
    </>
  )
}
