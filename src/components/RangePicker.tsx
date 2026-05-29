import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React from 'react';
import CustomSelect from './CustomSelect';
import type { SelectOptions } from '../types';

interface RangePickerProps {
  /** The full option list both ends choose from (e.g. 0–59 minutes). */
  baseOptions: SelectOptions[];
  start: SelectOptions;
  setStart: (value: SelectOptions) => void;
  end: SelectOptions;
  setEnd: (value: SelectOptions) => void;
  betweenText: string;
  andText: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const Connector = styled(Typography)({
  margin: '0 2px',
  display: 'flex',
  alignItems: 'center',
  height: '40px', // Match the height of CustomSelect components
});

// The "between X and Y" range used by Minute/Hour/DayOfMonth in every-mode.
// Extracted from the three near-identical field implementations: it owns the
// two mutually-constraining option lists (start can't reach past end, and vice
// versa) so each field no longer duplicates that pair of effects.
export default function RangePicker(props: RangePickerProps) {
  const { baseOptions, start, setStart, end, setEnd, betweenText, andText, size = 'md', disabled } =
    props;

  const [startOptions, setStartOptions] = React.useState(baseOptions);
  const [endOptions, setEndOptions] = React.useState(baseOptions);

  React.useEffect(() => {
    const startIndex = startOptions.findIndex((x) => x.value === start.value);
    setEndOptions(baseOptions.map((option, index) => ({ ...option, disabled: index <= startIndex })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start]);

  React.useEffect(() => {
    const endIndex = endOptions.findIndex((x) => x.value === end.value);
    setStartOptions(baseOptions.map((option, index) => ({ ...option, disabled: index >= endIndex })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [end]);

  return (
    <>
      <Connector>{betweenText}</Connector>
      <CustomSelect
        size={size}
        single
        options={startOptions}
        label={''}
        value={start}
        setValue={setStart}
        multiple={false}
        disableClearable
        disabled={disabled}
      />
      <Connector>{andText}</Connector>
      <CustomSelect
        size={size}
        single
        options={endOptions}
        label={''}
        value={end}
        setValue={setEnd}
        multiple={false}
        disableClearable
        disabled={disabled}
      />
    </>
  );
}
