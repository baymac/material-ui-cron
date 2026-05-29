import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/material/styles';
import React from 'react';
import type { SelectOptions } from '../types';
import { getSortedOptions } from '../utils';

interface ChipMultiSelectProps {
  /** All selectable options. */
  options: SelectOptions[];
  /** Currently selected options. */
  value: SelectOptions[];
  /** Called with the next selection (already sorted when `sort`). */
  onChange: (next: SelectOptions[]) => void;
  /** Accessible group label (also the field name for queries). */
  ariaLabel: string;
  /** Label for the "add" affordance. */
  addLabel: string;
  /** When true, the last remaining chip cannot be removed. */
  disableEmpty?: boolean;
  disabled?: boolean;
  /** Keep the selection numerically sorted (so it collapses to ranges). */
  sort?: boolean;
  /** Single-pick mode: adding replaces the selection (always exactly one). */
  single?: boolean;
}

const Group = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
});

// At-mode value picker: selected values show as deletable chips; an "add" chip
// opens a menu of the not-yet-selected options. Replaces the multi-select
// dropdown while routing through the same value setter (so cron serialization
// is unchanged).
export default function ChipMultiSelect(props: ChipMultiSelectProps) {
  const { options, value, onChange, ariaLabel, addLabel, disableEmpty, disabled, sort, single } =
    props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const selectedValues = new Set(value.map((option) => option.value));
  const available = options.filter(
    (option) => !selectedValues.has(option.value) && !option.disabled,
  );
  // A single-pick chip control always holds exactly one value, so its chip is
  // never removable (delete would empty it).
  const lockLast = single || (disableEmpty && value.length <= 1);

  const commit = (next: SelectOptions[]) => {
    onChange(sort ? getSortedOptions(next) : next);
  };

  const handleAdd = (option: SelectOptions) => {
    commit(single ? [option] : [...value, option]);
    setAnchorEl(null);
  };

  const handleRemove = (option: SelectOptions) => {
    if (lockLast) {
      return;
    }
    commit(value.filter((item) => item.value !== option.value));
  };

  return (
    <Group role='group' aria-label={ariaLabel}>
      {value.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          size='small'
          color='primary'
          variant='outlined'
          disabled={disabled}
          onDelete={lockLast || disabled ? undefined : () => handleRemove(option)}
        />
      ))}
      <Chip
        icon={<AddIcon fontSize='small' />}
        label={addLabel}
        size='small'
        variant='outlined'
        aria-label={addLabel}
        disabled={disabled || available.length === 0}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { style: { maxHeight: 280 } } }}
      >
        {available.map((option) => (
          <MenuItem key={option.value} onClick={() => handleAdd(option)}>
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </Group>
  );
}
