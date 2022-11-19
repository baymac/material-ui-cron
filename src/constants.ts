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

export const getPeriodOptions = (
  periodOptionLabels: string[]
): SelectOptions[] => [
  {
    label: periodOptionLabels[0],
    value: 'hour',
  },
  {
    label: periodOptionLabels[1],
    value: 'day',
  },
  {
    label: periodOptionLabels[2],
    value: 'week',
  },
  {
    label: periodOptionLabels[3],
    value: 'month',
  },
  {
    label: periodOptionLabels[4],
    value: 'year',
  },
]

export const getPeriodOptionsWithHourDisabled = (
  periodOptionLabels: string[]
) =>
  getPeriodOptions(periodOptionLabels).map((periodOption) =>
    periodOption.value === 'hour'
      ? {
          ...periodOption,
          disabled: true,
        }
      : periodOption
  )

/* WEEK */

export const weekOptions = (weekDayLabels: string[]): SelectOptions[] =>
  weekDayLabels.map((day, idx) => ({
    value: `${idx}`,
    label: day,
  }))

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

export const getLastDayOfMonthOption = (lastDayOfMonthLabel: string) => ({
  value: 'L',
  label: lastDayOfMonthLabel,
})

export const getDayOfMonthsOptionsWithL = (lastDayOfMonthLabel: string) =>
  defaultDayOfMonthOptionsWithOrdinal().concat(
    getLastDayOfMonthOption(lastDayOfMonthLabel)
  )

export const DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD =
  defaultDayOfMonthOptionsWithOrdinal()

export const DEFAULT_DAY_OF_MONTH_OPTS = defaultDayOfMonthOptions()

/* MONTH */

export const getMonthOptions = (monthOptionLabels: string[]) =>
  monthOptionLabels.map((month, idx) => ({
    value: `${idx + 1}`,
    label: month,
  }))

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

export const atEveryOptions = (
  atLabel: string,
  everyLabel: string
): SelectOptions[] => [
  {
    value: 'at',
    label: atLabel,
  },
  {
    value: 'every',
    label: everyLabel,
  },
]

export const everyOptionsNonAdmin = (
  atLabel: string,
  everyLabel: string
): SelectOptions[] => [
  {
    value: 'at',
    label: atLabel,
    disabled: true,
  },
  {
    value: 'every',
    label: everyLabel,
  },
]

export const atOptionsNonAdmin = (
  atLabel: string,
  everyLabel: string
): SelectOptions[] => [
  {
    value: 'at',
    label: atLabel,
  },
  {
    value: 'every',
    label: everyLabel,
    disabled: true,
  },
]
export const onEveryOptions = (
  onLabel: string,
  everyLabel: string
): SelectOptions[] => [
  {
    value: 'on',
    label: onLabel,
  },
  {
    value: 'every',
    label: everyLabel,
  },
]
