import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Autocomplete, { type AutocompleteChangeReason } from '@mui/material/Autocomplete';
import type React from 'react';
import type { CustomSelectProps, SelectOptions } from '../types';
import { getSortedOptions } from '../utils';

export default function CustomSelect<V extends SelectOptions | SelectOptions[]>(
  props: CustomSelectProps<V>,
) {
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

    // Each branch hands MUI's `newValue` (or a derived array/single) back to the
    // caller. The component is generic over `V`, but internally produces both
    // single and array shapes depending on `single`/`multiple`, so the value is
    // cast to `V` at the boundary — the field that owns the atom enforces the
    // real shape.
    if (reason === 'clear') {
      setValue([options[0]] as V);
    } else if (reason === 'selectOption' && single && props.multiple !== false) {
      const target = event.target as HTMLElement;
      const val = (newValue as unknown as SelectOptions[]).filter(
        (val) => val.label === target.textContent,
      );
      setValue(val as V);
    } else if (sort && reason === 'selectOption') {
      setValue(getSortedOptions(newValue as unknown as SelectOptions[]) as V);
    } else if (reason !== 'removeOption') {
      if (newValue !== null) {
        setValue(newValue as V);
      }
    } else if (reason === 'removeOption' && disableEmpty) {
      if (newValue && (newValue as SelectOptions[]).length !== 0) {
        setValue(newValue as V);
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
        sx={(theme) => ({
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
            // Pin the input's box-sizing so the field height is deterministic
            // across theme toggles. MUI's input relies on `content-box` + its
            // `height: 1.4375em` to render at full height; a surrounding
            // ScopedCssBaseline emits `.MuiScopedCssBaseline-root * { box-sizing:
            // inherit }` (→ border-box) at *equal specificity*, so which one wins
            // depends on emotion's injection order — and toggling dark mode
            // re-injects styles and flips it, collapsing the input and making the
            // select visibly jump up. Asserting it here wins on specificity and
            // keeps the height stable in every theme.
            boxSizing: 'content-box',
          },
          // Keep disabled text at full contrast (not the faded default) and
          // theme-aware: `text.primary` reads correctly on the card in both
          // light and dark mode (a hardcoded `white` was invisible in light).
          '& .MuiInputBase-root.Mui-disabled .MuiInputBase-input': {
            color: theme.palette.text.primary,
            WebkitTextFillColor: theme.palette.text.primary,
          },
        })}
        renderValue={
          // A true single-select (`multiple={false}`) renders its value as
          // normal input text via getOptionLabel — leave renderValue unset so
          // the field behaves like a plain select (and exposes input.value).
          props.multiple === false
            ? undefined
            : // Otherwise this is a `multiple` Autocomplete (value is an array).
              // `single` ones show the value as plain inline text — not removable
              // chips — so the field reads like a single select on one line.
              single
              ? (value) => {
                  const items = value as SelectOptions[];
                  return (
                    <span style={{ paddingLeft: 4, whiteSpace: 'nowrap' }}>
                      {items.map((option) => option.label).join(', ')}
                    </span>
                  );
                }
              : (value, getItemProps) => {
                // Cap the visible chips at MAX_VISIBLE (+ a "+N" indicator) even
                // when the field is focused/open. MUI normally shows *all* tags
                // when focused, which makes a many-selected field balloon (and,
                // when scrolled, slide chips under the floating label). Limiting
                // here keeps the field a bounded, stable height in every state.
                const MAX_VISIBLE = 3;
                const items = value as SelectOptions[];
                const shown = items.slice(0, MAX_VISIBLE);
                const extra = items.length - shown.length;
                const chips = shown.map((option, index) => {
                  const disableSingleItemRemove =
                    items.length === 1 && disableEmpty ? { onDelete: undefined } : {};
                  return (
                    <Chip
                      label={(option as SelectOptions).label}
                      size='small'
                      {...getItemProps({ index })}
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
              sx={(theme) => ({
                '& .MuiInputBase-input.Mui-disabled': {
                  color: theme.palette.text.primary,
                  WebkitTextFillColor: theme.palette.text.primary,
                },
              })}
            />
          );
        }}
        {...otherprops}
      />
    </>
  );
}
