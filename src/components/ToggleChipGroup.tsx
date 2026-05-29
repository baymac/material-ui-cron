import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';
import type { SelectOptions } from '../types';
import { getSortedOptions } from '../utils';

interface ToggleChipGroupProps {
  /** The fixed set of options, each rendered as a toggle chip. */
  options: SelectOptions[];
  /** Currently selected options. */
  value: SelectOptions[];
  /** Called with the next selection (already sorted when `sort`). */
  onChange: (next: SelectOptions[]) => void;
  /** Accessible group label. */
  ariaLabel: string;
  /** When true, the last remaining selection cannot be toggled off. */
  disableEmpty?: boolean;
  /** Keep the selection numerically sorted (so it collapses to ranges). */
  sort?: boolean;
}

const Group = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
});

// Fixed-set multi-select rendered as toggle chips (week days, months). A
// pressed chip is selected; clicking toggles membership. Routes through the
// same value setter as the old multi-select dropdown.
export default function ToggleChipGroup(props: ToggleChipGroupProps) {
  const { options, value, onChange, ariaLabel, disableEmpty, sort } = props;

  const selectedValues = new Set(value.map((option) => option.value));

  const toggle = (option: SelectOptions) => {
    if (selectedValues.has(option.value)) {
      if (disableEmpty && value.length <= 1) {
        return;
      }
      onChange(value.filter((item) => item.value !== option.value));
    } else {
      const next = [...value, option];
      onChange(sort ? getSortedOptions(next) : next);
    }
  };

  return (
    <Group role='group' aria-label={ariaLabel}>
      {options.map((option) => {
        const selected = selectedValues.has(option.value);
        return (
          <Chip
            key={option.value}
            label={option.label}
            size='small'
            aria-pressed={selected}
            color={selected ? 'primary' : 'default'}
            variant={selected ? 'filled' : 'outlined'}
            onClick={() => toggle(option)}
          />
        );
      })}
    </Group>
  );
}
