import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import type React from 'react';

// Stacked field row: a header above a wrapping row of controls. The header is
// either the connector word (EVERY, IN, ON) or, for fields with a mode toggle,
// the segmented toggle itself (AT/EVERY, ON/EVERY) — moved up here instead of
// sitting in the controls row.
const Row = styled(Box)(({ theme }) => ({
  padding: '12px 16px',
  borderTop: `1px solid ${theme.palette.divider}`,
  '&:first-of-type': {
    borderTop: 'none',
  },
}));

const Label = styled(Typography)(({ theme }) => ({
  fontSize: 11,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  fontWeight: 600,
  color: theme.palette.text.secondary,
}));

// Header slot. The bottom margin gives the select below some breathing room
// from the header / the select's own floating label.
const Header = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  minHeight: 20,
  marginBottom: 14,
  // A segmented-toggle header (AT/EVERY, ON/EVERY) has a hard bottom edge, and
  // the labeled select directly below it floats its outlined label up ~7px into
  // the gap — so on a stacked (mobile) card the whitespace under the toggle
  // reads tighter than the 14px rowGap between the rows further down. Add that
  // back here so every stacked gap looks even.
  '&[data-toggle="true"]': {
    '@container (max-width: 480px)': {
      marginBottom: 23,
    },
  },
});

const Controls = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  // Horizontal gap between inline controls; the larger rowGap is the vertical
  // rhythm used when controls wrap onto stacked lines (mobile), kept equal to
  // the header's marginBottom so every stacked row is evenly spaced.
  columnGap: 10,
  rowGap: 14,
  flexWrap: 'wrap',
});

interface FieldRowProps {
  /** Connector-word header (used when there is no mode toggle). */
  label?: string;
  /** Custom header content (e.g. the segmented toggle), replaces `label`. */
  headerSlot?: React.ReactNode;
  children: React.ReactNode;
}

export default function FieldRow(props: FieldRowProps) {
  const { label, headerSlot, children } = props;
  return (
    <Row>
      <Header data-toggle={headerSlot ? 'true' : undefined}>
        {headerSlot ?? <Label>{label}</Label>}
      </Header>
      <Controls>{children}</Controls>
    </Row>
  );
}
