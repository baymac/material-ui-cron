import Chip from '@material-ui/core/Chip'
import TextField from '@material-ui/core/TextField'
import Autocomplete, {
  AutocompleteChangeReason,
} from '@material-ui/core/Autocomplete'
import React from 'react'
import { CustomSelectProps, SelectOptions } from '../types'
import { getSortedOptions } from '../utils'

export default function CustomSelect(props: CustomSelectProps) {
  const {
    options,
    value,
    setValue,
    label,
    single,
    sort,
    disableEmpty,
    disableClearable,
    ...otherprops
  } = props

  const handleChange = (
    event: React.ChangeEvent<{}>,
    newValue: SelectOptions | SelectOptions[],
    reason: AutocompleteChangeReason
  ) => {
    if (reason === 'clear') {
      setValue([options[0]])
    } else if (
      reason === 'selectOption' &&
      single &&
      props.multiple !== false
    ) {
      const val = (newValue as unknown as SelectOptions[]).filter(
        // @ts-ignore
        (val) => val.label === event.target.childNodes[0].wholeText
      )
      setValue(val)
    } else if (sort && reason === 'selectOption') {
      setValue(getSortedOptions(newValue as unknown as SelectOptions[]))
    } else if (reason !== 'removeOption') {
      setValue(newValue)
    } else if (reason === 'removeOption' && disableEmpty) {
      if ((newValue as SelectOptions[]).length !== 0) {
        setValue(newValue)
      }
    }
  }

  return (
    <>
      <Autocomplete
        multiple
        options={options}
        value={value}
        onChange={handleChange}
        isOptionEqualToValue={(option, val) =>
          (option as SelectOptions).value === (val as SelectOptions).value
        }
        getOptionLabel={(option) => (option as SelectOptions).label}
        size='small'
        forcePopupIcon
        disableClearable={disableClearable}
        autoComplete
        disableCloseOnSelect={!single}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => {
            const disableSingleItemRemove =
              value.length === 1 && disableEmpty ? { onDelete: undefined } : {}
            return (
              <Chip
                label={(option as SelectOptions).label}
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
        renderInput={(params) => {
          return <TextField {...params} variant='outlined' label={label} />
        }}
        {...otherprops}
      />
    </>
  )
}
