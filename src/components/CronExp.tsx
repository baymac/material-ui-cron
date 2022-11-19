import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import React from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import useDebounce from '../hooks/useDebounce'
import { cronExpState } from '../selector'
import { cronExpInputState, isAdminState, variantState } from '../store'

export default function CronExp() {
  const isAdmin = useRecoilValue(isAdminState)

  const variant = useRecoilValue(variantState)

  const [cronExp, setCronExp] = useRecoilState(cronExpState)

  const [cronExpInput, setCronExpInput] = useRecoilState(cronExpInputState)

  const debouncedCronExpInput = useDebounce(cronExpInput, 500)

  React.useEffect(() => {
    setCronExpInput(cronExp)
  }, [cronExp])

  React.useEffect(() => {
    if (debouncedCronExpInput) {
      setCronExp(cronExpInput)
    }
  }, [debouncedCronExpInput])

  return (
    <Box display='flex' p={1} m={1}>
      <TextField
        variant={variant}
        value={cronExpInput}
        onChange={(event) => {
          setCronExpInput(event.target.value)
        }}
        sx={{
          mr: 1,
          '& input': {
            minWidth: 100,
            maxWidth: 200,
            wordSpacing: '5px',
          },
        }}
        disabled={!isAdmin}
      />
    </Box>
  )
}
