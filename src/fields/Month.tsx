import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/styles'
import clsx from 'clsx'
import React from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import CustomSelect from '../components/CustomSelect'
import { getMonthOptions } from '../constants'
import { localeState, monthState } from '../store'

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
  const resolvedLocale = useRecoilValue(localeState)
  const [monthOptions, setMonthOptions] = React.useState(
    getMonthOptions(resolvedLocale.shortMonthOptions)
  )

  return (
    <Box display='flex' p={1} m={1}>
      <Typography classes={{ root: classes.in }}>
        {resolvedLocale.inText}
      </Typography>
      <CustomSelect
        options={monthOptions}
        label={resolvedLocale.monthLabel}
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
