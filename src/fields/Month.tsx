import Box from '@material-ui/core/Box'
import { makeStyles } from '@material-ui/styles'
import Typography from '@material-ui/core/Typography'
import clsx from 'clsx'
import React from 'react'
import { useRecoilState } from 'recoil'
import CustomSelect from '../components/CustomSelect'
import { defaultMonthOptions } from '../constants'
import { monthState } from '../store'

const useStyles = makeStyles({
  month: {
    minWidth: '300px',
    maxWidth: '500px',
    marginRight: '6px',
  },
  in: {
    margin: '8.5px 6px 0 0',
  },
})

export default function Month() {
  const classes = useStyles()
  const [month, setMonth] = useRecoilState(monthState)
  const [monthOptions, setMonthOptions] = React.useState(defaultMonthOptions)

  return (
    <Box display='flex' p={1} m={1}>
      <Typography classes={{ root: classes.in }}>in</Typography>
      <CustomSelect
        options={monthOptions}
        label={'Month(s)'}
        value={month}
        setValue={setMonth}
        disableClearable
        sort
        disableEmpty
        classes={{
          root: clsx({
            [classes.month]: true,
          }),
        }}
        limitTags={3}
      />
    </Box>
  )
}
