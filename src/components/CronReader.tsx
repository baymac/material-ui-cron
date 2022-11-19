import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import cronstrue from 'cronstrue/i18n'
import React from 'react'
import { useRecoilValue } from 'recoil'
import { cronExpState } from '../selector'
import { cronValidationErrorMessageState, localeState } from '../store'

export default function CronReader() {
  const cronExp = useRecoilValue(cronExpState)
  const resolvedLocale = useRecoilValue(localeState)

  const [cronHr, setCronHr] = React.useState('')

  const cronValidationErrorMessage = useRecoilValue(
    cronValidationErrorMessageState
  )

  React.useEffect(() => {
    try {
      setCronHr(
        cronstrue.toString(cronExp, {
          locale: resolvedLocale.cronDescriptionText,
        })
      )
    } catch (e) {
      setCronHr('Incorrect cron selection')
    }
  }, [cronExp])

  return (
    <Box display='flex' p={1} m={1}>
      {cronValidationErrorMessage.length === 0 && (
        <Typography variant='h6' color='primary' className='MaterialCronHr'>
          {cronHr}
        </Typography>
      )}
      {cronValidationErrorMessage.length > 0 && (
        <Typography sx={{ color: 'red' }}>
          {cronValidationErrorMessage}
        </Typography>
      )}
    </Box>
  )
}
