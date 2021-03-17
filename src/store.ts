import { atom } from 'recoil'
import {
  atEveryOptions,
  defaultMinuteOptionsWithOrdinal,
  defaultWeekSelection,
  DEFAULT_DAY_OF_MONTH_OPTS,
  DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD,
  DEFAULT_HOUR_OPTS_EVERY,
  DEFAULT_MINUTE_OPTS,
  DEFAULT_MONTH_OPTS,
  onEveryOptions,
  periodOptions,
} from './constants'
import { SelectOptions } from './types'
import { getTimesOfTheDay } from './utils'

export const periodState = atom<SelectOptions>({
  key: 'periodState',
  default: periodOptions[1],
})

export const minuteState = atom<SelectOptions[]>({
  key: 'minuteState',
  default: [DEFAULT_MINUTE_OPTS[0]],
})

export const minuteAtEveryState = atom<SelectOptions>({
  key: 'minuteAtEveryState',
  default: atEveryOptions[0],
})

export const minuteRangeStartSchedulerState = atom({
  key: 'minuteRangeStartSchedulerState',
  default: defaultMinuteOptionsWithOrdinal()[0],
})

export const minuteRangeEndSchedulerState = atom({
  key: 'minuteRangeEndSchedulerState',
  default: defaultMinuteOptionsWithOrdinal()[59],
})

export const hourState = atom<SelectOptions[]>({
  key: 'hourState',
  default: [DEFAULT_HOUR_OPTS_EVERY[0]],
})

export const hourAtEveryState = atom<SelectOptions>({
  key: 'hourAtEveryState',
  default: atEveryOptions[0],
})

export const hourRangeStartSchedulerState = atom({
  key: 'hourRangeStartSchedulerState',
  default: getTimesOfTheDay()[0],
})

export const hourRangeEndSchedulerState = atom({
  key: 'hourRangeEndSchedulerState',
  default: getTimesOfTheDay()[23],
})

export const dayOfMonthAtEveryState = atom<SelectOptions>({
  key: 'dayOfMonthAtEveryState',
  default: onEveryOptions[0],
})

export const dayOfMonthState = atom<SelectOptions[]>({
  key: 'dayOfMonthState',
  default: DEFAULT_DAY_OF_MONTH_OPTS,
})

export const dayOfMonthRangeStartSchedulerState = atom({
  key: 'dayOfMonthRangeStartSchedulerState',
  default: DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD[0],
})

export const dayOfMonthRangeEndSchedulerState = atom({
  key: 'dayOfMonthRangeEndSchedulerState',
  default: DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD[30],
})

export const weekState = atom<SelectOptions[]>({
  key: 'weekState',
  default: defaultWeekSelection(),
})

export const monthState = atom<SelectOptions[]>({
  key: 'monthState',
  default: DEFAULT_MONTH_OPTS,
})

export const cronValidationErrorMessageState = atom<string>({
  key: 'cronValidationErrorMessageState',
  default: '',
})

export const isAdminState = atom<boolean>({
  key: 'isAdminState',
  default: false,
})

export const cronExpInputState = atom<string>({
  key: 'cronExpInputState',
  default: '0 0 * * *',
})
