import { makeStyles } from '@material-ui/styles'
import Typography from '@material-ui/core/Typography'
import clsx from 'clsx'
import React from 'react'
import { useRecoilState } from 'recoil'
import Box from '@material-ui/core/Box'
import CustomSelect from '../components/CustomSelect'
import { defaultWeekOptions } from '../constants'
import { weekState } from '../store'

const useStyles = makeStyles({
  week: {
    minWidth: '300px',
    maxWidth: '500px',
    marginRight: '6px',
  },
  on: {
    margin: '8.5px 6px 0 0',
  },
})

export default function Week() {
  const classes = useStyles()
  const [week, setWeek] = useRecoilState(weekState)
  const [weekOptions, setWeekOptions] = React.useState(defaultWeekOptions)

  return (
    <Box display='flex' p={1} m={1}>
      <Typography classes={{ root: classes.on }}>on</Typography>
      <CustomSelect
        options={weekOptions}
        label={'Day of the Week'}
        value={week}
        setValue={setWeek}
        disableClearable
        sort
        disableEmpty
        classes={{
          root: clsx({
            [classes.week]: true,
          }),
        }}
        limitTags={3}
      />
    </Box>
  )
}
