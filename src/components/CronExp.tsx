import Box from '@material-ui/core/Box'
import { makeStyles } from '@material-ui/styles'
import TextField from '@material-ui/core/TextField'
import React from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import useDebounce from '../hooks/useDebounce'
import { cronExpState } from '../selector'
import { cronExpInputState, isAdminState } from '../store'

const useStyles = makeStyles({
  cron: {
    marginRight: '6px',
    backgroundColor: '#382B5F',
    color: 'white',
    '& input:focus + fieldset': {
      borderWidth: 0,
      borderColor: '#382B5F',
    },
  },
  input: {
    minWidth: '100px',
    maxWidth: '200px',
    color: 'white',
    wordSpacing: '5px',
  },
  label: {
    color: 'white',
  },
})

export default function CronExp() {
  const classes = useStyles()

  const isAdmin = useRecoilValue(isAdminState)

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
        variant='outlined'
        value={cronExpInput}
        onChange={(event) => {
          setCronExpInput(event.target.value)
        }}
        label=''
        className={classes.cron}
        InputProps={{
          classes: {
            input: classes.input,
          },
        }}
        InputLabelProps={{
          classes: {
            root: classes.label,
          },
        }}
        disabled={!isAdmin}
      />
    </Box>
  )
}
