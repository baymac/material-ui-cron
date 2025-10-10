import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { styled } from '@mui/material/styles';
import React from 'react';
import { useAtom, useAtomValue } from 'jotai';
import useDebounce from '../hooks/useDebounce';
import { cronExpState } from '../selector';
import { cronExpInputState, isAdminState } from '../store';
import { IconButton } from '@mui/material';

const StyledBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 16px',
  margin: '8px 16px',
});

const StyledResetButton = styled(IconButton)({});

const StyledTextField = styled(TextField)({
  marginRight: '6px',
  backgroundColor: '#382B5F',
  color: 'white',
  borderRadius: '4px',
  '& .MuiOutlinedInput-root': {
    borderRadius: '4px !important',
    '& input': {
      minWidth: '100px',
      maxWidth: '200px',
      color: 'white',
      wordSpacing: '5px',
    },
    // Keep text white when disabled
    '&.Mui-disabled .MuiOutlinedInput-input': {
      color: 'white',
      WebkitTextFillColor: 'white',
    },
    '&.Mui-disabled input': {
      color: 'white',
      WebkitTextFillColor: 'white',
    },
    '& fieldset': {
      borderRadius: '4px !important',
    },
    '&:hover fieldset': {
      borderRadius: '4px !important',
    },
    '&:focus-within fieldset': {
      borderWidth: 0,
      borderColor: '#382B5F',
      borderRadius: '4px !important',
    },
    '&.Mui-focused fieldset': {
      borderRadius: '4px !important',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'white',
  },
  '& .MuiInputLabel-root.Mui-disabled': {
    color: 'white',
  },
});

export default function CronExp() {
  const isAdmin = useAtomValue(isAdminState);
  const [cronExp, setCronExp] = useAtom(cronExpState);
  const [cronExpInput, setCronExpInput] = useAtom(cronExpInputState);

  const debouncedCronExpInput = useDebounce(cronExpInput, 500);

  React.useEffect(() => {
    setCronExpInput(cronExp);
  }, [cronExp, setCronExpInput]);

  React.useEffect(() => {
    if (debouncedCronExpInput) {
      setCronExp(cronExpInput);
    }
  }, [debouncedCronExpInput, setCronExp, cronExpInput]);

  return (
    <StyledBox>
      <StyledTextField
        variant='outlined'
        value={cronExpInput}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setCronExpInput(event.target.value);
        }}
        label=''
        disabled={!isAdmin}
      />
      <Tooltip title='Reset' arrow>
        <span>
          <StyledResetButton onClick={() => setCronExpInput('0 0 * * *')} disabled={!isAdmin}>
            <RestartAltIcon />
          </StyledResetButton>
        </span>
      </Tooltip>
    </StyledBox>
  );
}
