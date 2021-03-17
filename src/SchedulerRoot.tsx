import React from 'react'
import { RecoilRoot } from 'recoil'
import Scheduler from './Scheduler'
import { SchedulerProps } from './types'

export default function SchedulerRoot(props: SchedulerProps) {
  return (
    <RecoilRoot>
      <Scheduler {...props} />
    </RecoilRoot>
  )
}
