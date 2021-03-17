import { AutocompleteGetTagProps } from '@material-ui/lab/Autocomplete'
import { SetterOrUpdater } from 'recoil'

export type PeriodType = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute'

export interface CustomSelectProps {
  renderTags?: (
    value: SelectOptions[],
    getTagProps: AutocompleteGetTagProps
  ) => React.ReactNode
  options: Array<SelectOptions>
  value: SelectOptions | SelectOptions[]
  setValue: SetterOrUpdater<SelectOptions | SelectOptions[]>
  noOptionsText?: string
  label: string
  size?: 'small' | 'medium'
  disableClearable?: boolean
  forcePopupIcon?: boolean
  disabled?: boolean
  multiple?: boolean
  filterSelectedOptions?: boolean
  className?: string
  classes?: any
  single?: boolean
  sort?: boolean
  disableEmpty?: boolean
  limitTags?: number
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
