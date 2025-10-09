import React from 'react';
import Scheduler from '../index';

export default {
  title: 'Material UI Cron',
  component: SchedulerDemo,
};

export function SchedulerDemo() {
  const [cronExp, setCronExp] = React.useState('0 0 * * *');
  const [cronError, setCronError] = React.useState(''); // get error message if cron is invalid
  const [isAdmin, setIsAdmin] = React.useState(false); // set admin or non-admin to enable or disable high frequency scheduling (more than once a day)

  return (
    <Scheduler cron={cronExp} setCron={setCronExp} setCronError={setCronError} isAdmin={isAdmin} />
  );
}
