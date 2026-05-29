import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

// Keeps the "between X and Y" range controls on a single line on a normal-width
// card. On a narrow (mobile) card the row can't fit, so it's allowed to wrap:
// "between" drops to its own line and the start/and/end pair (RangePair, which
// never breaks) moves below it together. The card establishes the `@container`.
const RangeGroup = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  // 10px between inline items; 14px row spacing once "between" drops to its own
  // line on mobile, matching the field header's vertical rhythm.
  columnGap: '10px',
  rowGap: '14px',
  flexWrap: 'nowrap',
  '@container (max-width: 480px)': {
    flexWrap: 'wrap',
  },
});

// The two range selects + "and" between them. Always on one line so the pair
// never splits across lines ("0 and 59" stays together).
export const RangePair = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'nowrap',
});

export default RangeGroup;
