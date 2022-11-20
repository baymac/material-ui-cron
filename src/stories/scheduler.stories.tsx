import React from 'react'
import Scheduler from '../index'

export default {
  title: 'Material UI Cron',
  component: SchedulerDemo,
}

export function SchedulerDemo() {
  const [cronExp, setCronExp] = React.useState('0 0 * * *')
  const [, setCronError] = React.useState('')
  const [isAdmin] = React.useState(true)

  return (
    <Scheduler
      cron={cronExp}
      setCron={setCronExp}
      setCronError={setCronError}
      isAdmin={isAdmin}
    />
  )
}
