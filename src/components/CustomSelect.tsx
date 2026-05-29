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
          '& .MuiAutocomplete-inputRoot': {
            cursor: 'pointer',
            // A single-value select renders its value inline (see renderTags);
            // keep it on one line so the field stays a normal single-line height.
            // (Multi-selects are bounded by capping the visible chips in
            // renderTags, so no maxHeight/scroll is needed here.)
            ...(single ? { flexWrap: 'nowrap' } : {}),
          },
          '& .MuiAutocomplete-input': {
            cursor: 'pointer',
          },
          // Keep text legible (non-transparent) when disabled.
          '& .MuiInputBase-root.Mui-disabled .MuiInputBase-input': {
            color: 'white',
            WebkitTextFillColor: 'white',
          },
        }}
        renderTags={
          // Single-value selects (e.g. the every-mode interval) show the value
          // as plain inline text — not a removable chip — so the field reads
          // like a normal single select and stays a single line tall.
          single
            ? (value) => (
                <span style={{ paddingLeft: 4, whiteSpace: 'nowrap' }}>
                  {(value as SelectOptions[]).map((option) => option.label).join(', ')}
                </span>
              )
            : (value, getTagProps) => {
                // Cap the visible chips at MAX_VISIBLE (+ a "+N" indicator) even
                // when the field is focused/open. MUI normally shows *all* tags
                // when focused, which makes a many-selected field balloon (and,
                // when scrolled, slide chips under the floating label). Limiting
                // here keeps the field a bounded, stable height in every state.
                const MAX_VISIBLE = 3;
                const shown = value.slice(0, MAX_VISIBLE);
                const extra = value.length - shown.length;
                const chips = shown.map((option, index) => {
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
                });
                if (extra > 0) {
                  chips.push(<Chip key='__more' label={`+${extra}`} size='small' />);
                }
                return chips;
              }
        }
        getOptionDisabled={(option) => ((option as SelectOptions).disabled ? true : false)}
        renderInput={(params) => {
          return (
            <TextField
              {...params}
              variant='outlined'
              // Field-name label (Hour(s), Minute(s), ...). The FieldRow header
              // names the *section* by its connector word (At/Every, on, ...),
              // so this field-name label is complementary, not redundant.
              label={label}
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
