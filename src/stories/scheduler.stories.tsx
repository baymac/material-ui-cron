import { expect, userEvent, waitFor, within } from '@storybook/test';
import React from 'react';
import Scheduler from '../index';

export default {
  title: 'Material UI Cron',
  component: SchedulerDemo,
};

export function SchedulerDemo() {
  const [cronExp, setCronExp] = React.useState('0 0 * * *');
  const [, setCronError] = React.useState('');
  const [isAdmin] = React.useState(true);

  return (
    <Scheduler cron={cronExp} setCron={setCronExp} setCronError={setCronError} isAdmin={isAdmin} />
  );
}

export const Default = () => <SchedulerDemo />;

Default.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);

  // Verify default cron expression is displayed
  const cronInput = await canvas.findByDisplayValue('0 0 * * *');
  expect(cronInput).toBeInTheDocument();

  // Verify key fields exist
  expect(await canvas.findByLabelText('Period')).toHaveValue('day');
  expect(await canvas.findByLabelText('Minute(s)')).toBeInTheDocument();
  expect(await canvas.findByLabelText('Hour(s)')).toBeInTheDocument();
};

function SchedulerNonAdminDemo() {
  const [cronExp, setCronExp] = React.useState('0 0 * * *');
  const [, setCronError] = React.useState('');
  return (
    <Scheduler cron={cronExp} setCron={setCronExp} setCronError={setCronError} isAdmin={false} />
  );
}

export const NonAdmin = () => <SchedulerNonAdminDemo />;

NonAdmin.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);

  // Verify cron input is disabled for non-admin
  const cronInput = await canvas.findByDisplayValue('0 0 * * *');
  expect(cronInput).toBeDisabled();
};

function SchedulerPropChangeDemo() {
  const [cronExp, setCronExp] = React.useState('0 0 * * *');
  const [, setCronError] = React.useState('');
  return (
    <div>
      <button type='button' onClick={() => setCronExp('*/5 * * * *')}>
        Apply */5 * * * *
      </button>
      <Scheduler cron={cronExp} setCron={setCronExp} setCronError={setCronError} isAdmin />
    </div>
  );
}

export const PropChange = () => <SchedulerPropChangeDemo />;

PropChange.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const user = userEvent.setup();

  // Test that external prop changes sync to the component
  const btn = await canvas.findByRole('button', { name: 'Apply */5 * * * *' });
  await user.click(btn);
  await waitFor(() => expect(canvas.getByDisplayValue('*/5 * * * *')).toBeInTheDocument());
};
