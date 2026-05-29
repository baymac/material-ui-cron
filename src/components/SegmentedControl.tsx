import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { styled } from '@mui/material/styles';
import type { SelectOptions } from '../types';

interface SegmentedControlProps {
  /** The (binary) options to toggle between, e.g. at/every or on/every. */
  options: SelectOptions[];
  /** The currently selected option. */
  value: SelectOptions;
  /** Called with the newly selected option object. */
  setValue: (value: SelectOptions) => void;
  /** Accessible group label. */
  ariaLabel: string;
  /** Disable the whole group. */
  disabled?: boolean;
}

// Pill-style segmented toggle that replaces the old At/Every (On/Every)
// dropdown. Theme-aware: the selected segment fills with `primary.main`, so it
// inherits the host theme (including dark mode) instead of hardcoded colors.
const StyledGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  borderRadius: 9,
  '& .MuiToggleButton-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: 12.5,
    lineHeight: 1.2,
    // Compact: the toggle now lives in the section header, not next to the
    // value select, so it doesn't need to match the select's height.
    height: 28,
    padding: '0 12px',
    color: theme.palette.text.secondary,
    borderColor: theme.palette.divider,
    '&.Mui-selected': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
  },
}));

export default function SegmentedControl(props: SegmentedControlProps) {
  const { options, value, setValue, ariaLabel, disabled } = props;

  return (
    <StyledGroup
      exclusive
      size='small'
      value={value.value}
      aria-label={ariaLabel}
      onChange={(_event, next: string | null) => {
        // `exclusive` emits `null` when the active button is re-clicked; ignore
        // it so one segment always stays selected (the field has no "neither"
        // state). Also guard against selecting a disabled option (e.g. a
        // non-admin who can't pick "every").
        if (next === null) {
          return;
        }
        const match = options.find((option) => option.value === next);
        if (match && !match.disabled) {
          setValue(match);
        }
      }}
    >
      {options.map((option) => (
        <ToggleButton
          key={option.value}
          value={option.value}
          disabled={disabled || option.disabled}
          aria-label={option.label}
        >
          {option.label}
        </ToggleButton>
      ))}
    </StyledGroup>
  );
}
