import { SelectOptions } from './types'
import { getTimesOfTheDayList, range } from './utils'

export const generateOrdinalOptions = (
  start: number,
  end: number
): SelectOptions[] => {
  return range(start, end).map((day) => {
    let customLabel = `${day}th`
    if (!(day.length > 1 && day.startsWith('1'))) {
      if (day.endsWith('1')) {
        customLabel = `${day}st`
      } else if (day.endsWith('2')) {
        customLabel = `${day}nd`
      } else if (day.endsWith('3')) {
        customLabel = `${day}rd`
      }
    } else if (day === '0') {
      customLabel = '0'
    }
    return {
      value: day,
      label: customLabel,
    }
  })
}

/* PERIOD */

export const periodOptions: SelectOptions[] = [
  {
    value: 'hour',
    label: 'hour',
  },
  {
    value: 'day',
    label: 'day',
  },
  {
    value: 'week',
    label: 'week',
  },
  {
    value: 'month',
    label: 'month',
  },
  {
    value: 'year',
    label: 'year',
  },
]

const periodOptionsWithHourDisabled = () =>
  periodOptions.map((periodOption) =>
    periodOption.value === 'hour'
      ? {
          ...periodOption,
          disabled: true,
        }
      : periodOption
  )

export const periodOptionsNonAdmin: SelectOptions[] = periodOptionsWithHourDisabled()

/* WEEK */

export const WEEK_DAYS = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
]

export const defaultWeekOptions = () =>
  WEEK_DAYS.map((day, idx) => ({
    value: `${idx}`,
    label: day,
  }))

export const DEFAULT_WEEK_OPTS = [
  { value: '0', label: 'SUNDAY' },
  { value: '1', label: 'MONDAY' },
  { value: '2', label: 'TUESDAY' },
  { value: '3', label: 'WEDNESDAY' },
  { value: '4', label: 'THURSDAY' },
  { value: '5', label: 'FRIDAY' },
  { value: '6', label: 'SATURDAY' },
]

export const defaultWeekSelection = () => defaultWeekOptions()

/* DAY OF MONTH */

export const defaultDayOfMonthOptions = () => {
  return range(1, 31).map((day) => {
    return {
      value: `${day}`,
      label: `${day}`,
    }
  })
}

export const defaultDayOfMonthOptionsWithOrdinal = () => {
  return generateOrdinalOptions(1, 31)
}

export const LAST_DAY_OF_MONTH_OPT = {
  value: 'L',
  label: 'Last Day of Month',
}

export const DEFAULT_DAY_OF_MONTH_OPTS_WITH_L = defaultDayOfMonthOptionsWithOrdinal().concat(
  LAST_DAY_OF_MONTH_OPT
)

export const DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD = defaultDayOfMonthOptionsWithOrdinal()

export const DEFAULT_DAY_OF_MONTH_OPTS = defaultDayOfMonthOptions()

/* MONTH */

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export const defaultMonthOptions = () =>
  MONTHS.map((month, idx) => ({
    value: `${idx + 1}`,
    label: MONTHS_SHORT[idx],
  }))

export const DEFAULT_MONTH_OPTS = defaultMonthOptions()

/* HOUR */

export const defaultHourOptionsHr = () => {
  return getTimesOfTheDayList().map((time, idx) => {
    return {
      value: `${idx}`,
      label: time,
    }
  })
}

export const defaultHourOptions = (type?: string) => {
  return range(0, 23).map((time) => {
    return {
      value: `${time}`,
      label: `${time}`,
      ...(time === '0' && type === 'every' && { disabled: true }),
    }
  })
}

export const DEFAULT_HOUR_OPTS_AT = defaultHourOptions()

export const DEFAULT_HOUR_OPTS_EVERY = defaultHourOptions('every')

/* MINUTE */

export const defaultMinuteOptions = (): SelectOptions[] => {
  return range(0, 59).map((time) => {
    return {
      value: `${time}`,
      label: `${time}`,
    }
  })
}

export const defaultMinuteOptionsWithOrdinal = () => DEFAULT_MINUTE_OPTS

export const DEFAULT_MINUTE_OPTS = defaultMinuteOptions()

export const atEveryOptions: SelectOptions[] = [
  {
    value: 'at',
    label: 'at',
  },
  {
    value: 'every',
    label: 'every',
  },
]

export const everyOptionsNonAdmin: SelectOptions[] = [
  {
    value: 'at',
    label: 'at',
    disabled: true,
  },
  {
    value: 'every',
    label: 'every',
  },
]

export const atOptionsNonAdmin: SelectOptions[] = [
  {
    value: 'at',
    label: 'at',
  },
  {
    value: 'every',
    label: 'every',
    disabled: true,
  },
]

export const onEveryOptions: SelectOptions[] = [
  {
    value: 'on',
    label: 'on',
  },
  {
    value: 'every',
    label: 'every',
  },
]
