import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Autocomplete, { type AutocompleteChangeReason } from '@mui/material/Autocomplete';
import type React from 'react';
import type { CustomSelectProps, SelectOptions } from '../types';
import { getSortedOptions } from '../utils';

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
    size = 'md',
    ...otherprops
  } = props;

  // Map custom sizes to MUI sizes and widths
  const getSizeConfig = (customSize: 'sm' | 'md' | 'lg') => {
    switch (customSize) {
      case 'sm':
        return { muiSize: 'small' as const, width: '100px' };
      case 'md':
        return { muiSize: 'small' as const, width: '160px' };
      case 'lg':
        return { muiSize: 'small' as const, width: '300px' };
      default:
        return { muiSize: 'small' as const, width: '100px' };
    }
  };

  const sizeConfig = getSizeConfig(size);

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: SelectOptions | SelectOptions[] | null,
    reason: AutocompleteChangeReason,
  ) => {
    // Prevent unnecessary updates if value hasn't changed
    if (JSON.stringify(newValue) === JSON.stringify(value)) {
      return;
    }

    if (reason === 'clear') {
      setValue([options[0]]);
    } else if (reason === 'selectOption' && single && props.multiple !== false) {
      const target = event.target as HTMLElement;
      const val = (newValue as unknown as SelectOptions[]).filter(
        (val) => val.label === target.textContent,
      );
      setValue(val);
    } else if (sort && reason === 'selectOption') {
      setValue(getSortedOptions(newValue as unknown as SelectOptions[]));
    } else if (reason !== 'removeOption') {
      if (newValue !== null) {
        setValue(newValue);
      }
    } else if (reason === 'removeOption' && disableEmpty) {
      if (newValue && (newValue as SelectOptions[]).length !== 0) {
        setValue(newValue);
      }
    }
  };

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
        size={sizeConfig.muiSize}
        forcePopupIcon
        disableClearable={disableClearable}
        autoComplete
        disableCloseOnSelect={!single}
        sx={{
          width: sizeConfig.width,
          '& .MuiAutocomplete-inputRoot': {
            cursor: 'pointer',
          },
          '& .MuiAutocomplete-input': {
            cursor: 'pointer',
          },
          // Keep text and label white when disabled
          '& .MuiInputBase-root.Mui-disabled .MuiInputBase-input': {
            color: 'white',
            WebkitTextFillColor: 'white',
          },
          '& .MuiInputBase-root.Mui-disabled .MuiInputLabel-root': {
            color: 'white',
          },
          '& .MuiFormLabel-root.Mui-disabled': {
            color: 'white',
          },
        }}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => {
            const disableSingleItemRemove =
              value.length === 1 && disableEmpty ? { onDelete: undefined } : {};
            return (
              <Chip
                label={(option as SelectOptions).label}
                size='small'
                {...getTagProps({ index })}
                {...disableSingleItemRemove}
                key={(option as SelectOptions).label}
              />
            );
          })
        }
        getOptionDisabled={(option) => ((option as SelectOptions).disabled ? true : false)}
        renderInput={(params) => {
          return (
            <TextField
              {...params}
              variant='outlined'
              label={label}
              sx={{
                '& .MuiInputBase-input.Mui-disabled': {
                  color: 'white',
                  WebkitTextFillColor: 'white',
                },
                '& .MuiFormLabel-root.Mui-disabled': {
                  color: 'white',
                },
              }}
            />
          );
        }}
        {...otherprops}
      />
    </>
  );
}
