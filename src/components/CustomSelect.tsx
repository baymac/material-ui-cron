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

  // Map custom sizes to MUI sizes and widths. Widths are kept tight so a select
  // showing a short value (e.g. "week", "9") doesn't stretch across the row;
  // multi-select sizes (lg) leave room for a few chips before wrapping.
  const getSizeConfig = (customSize: 'sm' | 'md' | 'lg') => {
    switch (customSize) {
      case 'sm':
        return { muiSize: 'small' as const, width: '110px' };
      case 'md':
        return { muiSize: 'small' as const, width: '140px' };
      case 'lg':
        return { muiSize: 'small' as const, width: '190px' };
      default:
        return { muiSize: 'small' as const, width: '110px' };
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
        // Single-value selects must close on selection. Because these are
        // rendered as `multiple` Autocompletes, re-render churn after a
        // selection can otherwise leave the popup open — blurOnSelect forces
        // it shut. Multi-selects keep the popup open for further picks.
        blurOnSelect={single ? true : undefined}
        sx={{
          width: sizeConfig.width,
          // Compact the input so its height matches the segmented toggle (~30px)
          // instead of MUI's default ~40px small field. Match MUI's own
          // selector specificity (.MuiAutocomplete-inputRoot.MuiInputBase-sizeSmall)
          // so these padding overrides actually win.
          '& .MuiAutocomplete-inputRoot.MuiInputBase-sizeSmall': {
            cursor: 'pointer',
            minHeight: 30,
            paddingTop: '1px',
            paddingBottom: '1px',
          },
          '& .MuiAutocomplete-inputRoot.MuiInputBase-sizeSmall .MuiAutocomplete-input': {
            cursor: 'pointer',
            paddingTop: '1.5px',
            paddingBottom: '1.5px',
          },
          // Keep text legible (non-transparent) when disabled.
          '& .MuiInputBase-root.Mui-disabled .MuiInputBase-input': {
            color: 'white',
            WebkitTextFillColor: 'white',
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
        renderInput={({ inputProps, ...params }) => {
          return (
            <TextField
              {...params}
              variant='outlined'
              // The field name already shows in the FieldRow's uppercase header
              // above this control, so rendering it again as a floating label is
              // redundant. Keep it only as the input's accessible name. (inputProps
              // is destructured out of params so it doesn't clash with slotProps.)
              slotProps={{ htmlInput: { ...inputProps, 'aria-label': label } }}
              sx={{
                '& .MuiInputBase-input.Mui-disabled': {
                  color: 'white',
                  WebkitTextFillColor: 'white',
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
