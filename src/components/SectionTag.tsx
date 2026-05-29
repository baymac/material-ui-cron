import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

// A single, non-interactive blue pill mirroring the *selected* segment of the
// SegmentedControl. Used as the header for sections that have only one possible
// connector (Every / in / on) so every section header reads as a toggle button.
const SectionTag = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  height: 28,
  padding: '0 12px',
  // Match the toggle buttons' corner radius (MUI ToggleButton uses
  // theme.shape.borderRadius), so the standalone pill isn't more rounded than
  // the 2-way toggle next to it.
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontWeight: 600,
  fontSize: 12.5,
  lineHeight: 1.2,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
}));

export default SectionTag;
