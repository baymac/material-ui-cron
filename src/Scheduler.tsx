import Box from '@mui/material/Box'
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
import { supportedLanguages } from './i18n'
import { cronExpState } from './selector'
import {
  cronExpInputState,
  cronValidationErrorMessageState,
  dayOfMonthState,
  hourState,
  isAdminState,
  localeState,
  minuteState,
  monthState,
  periodState,
  weekState,
  variantState,
} from './store'
import { SchedulerProps } from './types'
import { getPeriodIndex } from './utils'

export default function Scheduler(props: SchedulerProps) {
  const {
    cron,
    setCron,
    setCronError,
    isAdmin,
    locale,
    customLocale,
    variant,
  } = props
  const period = useRecoilValue(periodState)
  const [periodIndex, setPeriodIndex] = React.useState(0)

  const setVariant = useSetRecoilState(variantState)

  const setCronExp = useSetRecoilState(cronExpState)

  const cronError = useRecoilValue(cronValidationErrorMessageState)
  const setIsAdmin = useSetRecoilState(isAdminState)

  const [cronExpInput, setCronExpInput] = useRecoilState(cronExpInputState)
  const setResolvedLocale = useSetRecoilState(localeState)

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

  React.useEffect(() => {
    if (customLocale) {
      setResolvedLocale(customLocale)
    } else if (locale) {
      setResolvedLocale(supportedLanguages[locale])
    } else {
      setResolvedLocale(supportedLanguages['en'])
    }
  }, [locale, customLocale])

  React.useEffect(() => {
    setVariant(variant)
  }, [variant])

  return (
    <Box
      display='flex'
      flexDirection='column'
      sx={{ minHeight: 'min-content' }}
    >
      <Period />
      {periodIndex > 3 && <Month />}
      {periodIndex > 2 && <DayOfMonth />}
      {periodIndex > 1 && <Week />}
      {periodIndex > 0 && <Hour />}
      <Minute />
      <CronExp />
      <CronReader />
    </Box>
  )
}
