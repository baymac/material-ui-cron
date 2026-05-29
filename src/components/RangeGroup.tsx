import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

// Wraps the "between X and Y" range controls so they always stay on a single
// line. The group can wrap as a whole (relative to the value select) on a
// narrow card, but `between`, the two selects and `and` never break apart.
const RangeGroup = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'nowrap',
});

export default RangeGroup;
