import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import React from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import useDebounce from '../hooks/useDebounce'
import { cronExpState } from '../selector'
import { cronExpInputState, isAdminState } from '../store'

const StyledTextField = styled(TextField)({
  marginRight: '6px',
  backgroundColor: '#382B5F',
  color: 'white',
  '& .MuiOutlinedInput-root': {
    '& input': {
      minWidth: '100px',
      maxWidth: '200px',
      color: 'white',
      wordSpacing: '5px',
    },
    '&:focus-within fieldset': {
      borderWidth: 0,
      borderColor: '#382B5F',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'white',
  },
})

export default function CronExp() {
  const isAdmin = useRecoilValue(isAdminState)

  const [cronExp, setCronExp] = useRecoilState(cronExpState)

  const [cronExpInput, setCronExpInput] = useRecoilState(cronExpInputState)

  const debouncedCronExpInput = useDebounce(cronExpInput, 500)

  React.useEffect(() => {
    setCronExpInput(cronExp)
  }, [cronExp, setCronExpInput])

  React.useEffect(() => {
    if (debouncedCronExpInput) {
      setCronExp(cronExpInput)
    }
  }, [debouncedCronExpInput, setCronExp, cronExpInput])

  return (
    <Box display='flex' p={1} m={1}>
      <StyledTextField
        variant='outlined'
        value={cronExpInput}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setCronExpInput(event.target.value)
        }}
        label=''
        disabled={!isAdmin}
      />
    </Box>
  )
}
