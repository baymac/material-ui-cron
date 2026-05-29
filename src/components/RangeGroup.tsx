import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

// Keeps the "between X and Y" range controls on a single line on a normal-width
// card. On a narrow (mobile) card the row can't fit, so the controls are
// allowed to wrap — the range flows below instead of overflowing/clipping off
// the right edge. The card establishes the `@container` context.
const RangeGroup = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'nowrap',
  '@container (max-width: 480px)': {
    flexWrap: 'wrap',
  },
});

export default RangeGroup;
