import Box from '@material-ui/core/Box/Box'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import clsx from 'clsx'
import React from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import CustomSelect from '../components/CustomSelect'
import { periodOptions, periodOptionsNonAdmin } from '../constants'
import { isAdminState, periodState } from '../store'

const useStyles = makeStyles({
  period: {
    minWidth: 200,
    marginRight: '6px',
    maxWidth: 200,
  },
  every: {
    margin: '8.5px 6px 0 0',
  },
})

export default function Period() {
  const [period, setPeriod] = useRecoilState(periodState)
  const classes = useStyles()

  const isAdmin = useRecoilValue(isAdminState)

  return (
    <Box display='flex' p={1} m={1}>
      <Typography classes={{ root: classes.every }}>Every</Typography>
      <CustomSelect
        disableClearable
        options={isAdmin ? periodOptions : periodOptionsNonAdmin}
        label={'Period'}
        value={period}
        setValue={setPeriod}
        multiple={false}
        classes={{
          root: clsx({
            [classes.period]: true,
          }),
        }}
      />
    </Box>
  )
}
