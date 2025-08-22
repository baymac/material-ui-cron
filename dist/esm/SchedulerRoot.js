import React from 'react';
import { RecoilRoot } from 'recoil';
import Scheduler from './Scheduler';
export default function SchedulerRoot(props) {
  return React.createElement(RecoilRoot, null, React.createElement(Scheduler, props));
}