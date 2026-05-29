import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import type React from 'react';

// Stacked field row: an uppercase label above a wrapping row of controls. This
// replaces the old fixed `100px 1fr` two-column grid so the controls (segmented
// pills + value dropdowns) read top-to-bottom and wrap cleanly on narrow cards.
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
  marginBottom: 8,
}));

const Controls = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  flexWrap: 'wrap',
});

interface FieldRowProps {
  label: string;
  children: React.ReactNode;
}

export default function FieldRow(props: FieldRowProps) {
  const { label, children } = props;
  return (
    <Row>
      <Label>{label}</Label>
      <Controls>{children}</Controls>
    </Row>
  );
}
