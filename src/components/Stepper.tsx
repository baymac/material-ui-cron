import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { styled } from '@mui/material/styles';

interface StepperProps {
  /** Current numeric value. */
  value: number;
  /** Inclusive bounds. */
  min: number;
  max: number;
  /** Called with the clamped next value. */
  onChange: (next: number) => void;
  disabled?: boolean;
  ariaLabel: string;
}

// Compact numeric stepper (− value +) used for the "every N" interval. Theme-
// aware borders/hover so it adapts to the host theme + dark mode.
const Frame = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 9,
  overflow: 'hidden',
}));

const StepButton = styled(IconButton)(({ theme }) => ({
  borderRadius: 0,
  padding: 6,
  color: theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.primary.main,
  },
}));

const Value = styled('span')(({ theme }) => ({
  minWidth: 40,
  textAlign: 'center',
  fontWeight: 600,
  fontSize: 14,
  padding: '0 4px',
  borderLeft: `1px solid ${theme.palette.divider}`,
  borderRight: `1px solid ${theme.palette.divider}`,
  alignSelf: 'stretch',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

export default function Stepper(props: StepperProps) {
  const { value, min, max, onChange, disabled, ariaLabel } = props;

  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  return (
    <Frame role='group' aria-label={ariaLabel}>
      <StepButton
        size='small'
        aria-label={`${ariaLabel} decrement`}
        disabled={disabled || value <= min}
        onClick={() => onChange(clamp(value - 1))}
      >
        <RemoveIcon fontSize='small' />
      </StepButton>
      <Value aria-live='polite'>{value}</Value>
      <StepButton
        size='small'
        aria-label={`${ariaLabel} increment`}
        disabled={disabled || value >= max}
        onClick={() => onChange(clamp(value + 1))}
      >
        <AddIcon fontSize='small' />
      </StepButton>
    </Frame>
  );
}
