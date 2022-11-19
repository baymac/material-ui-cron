import type {
  AutocompleteProps,
  AutocompleteRenderInputParams,
} from '@mui/material/Autocomplete'

export type PeriodType = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute'

export interface CustomSelectProps<
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined
> extends Omit<
    AutocompleteProps<SelectOptions, Multiple, DisableClearable, false>,
    'renderInput'
  > {
  setValue(val: Multiple extends true ? SelectOptions[] : SelectOptions): void
  label?: string
  filterSelectedOptions?: boolean
  single?: boolean
  sort?: boolean
  disableEmpty?: boolean
  renderInput?: (params: AutocompleteRenderInputParams) => React.ReactNode
}

export interface SelectOptions {
  value: string
  label: string
  disabled?: boolean
}

export interface CronAndHrTime {
  hrTime: string
  cronTime: string
}

export interface CronValidation {
  isValid: boolean
  message: string
}

export interface SchedulerProps {
  cron: string
  setCron: React.Dispatch<React.SetStateAction<string>>
  setCronError: React.Dispatch<React.SetStateAction<string>>
  isAdmin?: boolean
  locale?: definedLocales
  customLocale?: Locale
  variant?: 'standard' | 'outlined' | 'filled'
}

export interface Locale {
  atEveryText: string
  betweenText: string
  inText: string
  onText: string
  andText: string
  onEveryText: string
  everyText: string
  atOptionLabel: string
  everyOptionLabel: string
  periodLabel: string
  minuteLabel: string
  monthLabel: string
  multiDayOfMonthLabel: string
  dayOfMonthLabel: string
  hourLabel: string
  dayOfWeekLabel: string
  weekDaysOptions: string[]
  periodOptions: string[]
  shortMonthOptions: string[]
  onOptionLabel: string
  lastDayOfMonthLabel: string
  cronDescriptionText: // Can be among the list of locale available for construe library https://github.com/bradymholt/cronstrue#supported-locales, if more locales added to construe, add it here
  | 'en'
    | 'ca'
    | 'cs'
    | 'es'
    | 'da'
    | 'de'
    | 'fi'
    | 'fr'
    | 'fa'
    | 'he'
    | 'it'
    | 'ja'
    | 'ko'
    | 'nb'
    | 'nl'
    | 'pl'
    | 'pt_BR'
    | 'ro'
    | 'ru'
    | 'sk'
    | 'sl'
    | 'sw'
    | 'sv'
    | 'tr'
    | 'uk'
    | 'zh_CN'
    | 'zh_TW'
}

export type definedLocales = 'en' | 'zh_CN'

export type definedLocalesMap = Record<definedLocales, Locale>
