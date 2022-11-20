import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import Autocomplete, {
  AutocompleteChangeReason,
} from '@mui/material/Autocomplete'
import { variantState } from '../store'
import { useRecoilValue } from 'recoil'
import React from 'react'
import { CustomSelectProps, SelectOptions } from '../types'
import { getSortedOptions } from '../utils'

export default function CustomSelect<
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined
>(props: CustomSelectProps<Multiple, DisableClearable>) {
  const {
    options,
    value,
    setValue,
    label,
    single,
    sort,
    disableEmpty,
    ...otherProps
  } = props

  const variant = useRecoilValue(variantState)

  const handleChange = (
    event: React.ChangeEvent<any>,
    newValue: SelectOptions | SelectOptions[] | null,
    reason: AutocompleteChangeReason
  ) => {
    const setValueFn: any = setValue
    if (reason === 'clear') {
      setValueFn([options[0]])
    } else if (
      reason === 'selectOption' &&
      single &&
      props.multiple !== false
    ) {
      const val = (newValue as unknown as SelectOptions[]).filter(
        (val) => val.label === (event.target.childNodes[0] as Text).wholeText
      )
      setValueFn(val)
    } else if (sort && reason === 'selectOption') {
      setValueFn(getSortedOptions(newValue as unknown as SelectOptions[]))
    } else if (reason !== 'removeOption') {
      setValueFn(newValue!)
    } else if (reason === 'removeOption' && disableEmpty) {
      if ((newValue as SelectOptions[]).length !== 0) {
        setValueFn(newValue!)
      }
    }
  }

  return (
    <Autocomplete
      options={options}
      value={value!}
      onChange={handleChange}
      isOptionEqualToValue={(option, val) =>
        (option as SelectOptions).value === (val as SelectOptions).value
      }
      getOptionLabel={(option) => option.label}
      size='small'
      forcePopupIcon
      autoComplete
      disableCloseOnSelect={!single}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => {
          const disableSingleItemRemove =
            value.length === 1 && disableEmpty ? { onDelete: undefined } : {}
          return (
            // eslint-disable-next-line react/jsx-key
            <Chip
              label={option.label}
              size='small'
              {...getTagProps({ index })}
              {...disableSingleItemRemove}
            />
          )
        })
      }
      getOptionDisabled={(option) =>
        (option as SelectOptions).disabled ? true : false
      }
      renderInput={(params) => (
        <TextField {...params} variant={variant} label={label} />
      )}
      {...otherProps}
    />
  )
}
