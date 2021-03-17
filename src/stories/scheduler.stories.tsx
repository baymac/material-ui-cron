import React from 'react'
import { RecoilRoot } from 'recoil'
import Scheduler from '../Scheduler'

export default {
  title: 'Material UI Cron',
  component: SchedulerDemo,
}

export function SchedulerDemo() {
  const [cronExp, setCronExp] = React.useState('0 0 * * *')
  const [cronError, setCronError] = React.useState('')
  const [isAdmin, setIsAdmin] = React.useState(true)

  return (
    <>
      <RecoilRoot>
        <Scheduler
          cron={cronExp}
          setCron={setCronExp}
          setCronError={setCronError}
          isAdmin={isAdmin}
        />
      </RecoilRoot>
    </>
  )
}
