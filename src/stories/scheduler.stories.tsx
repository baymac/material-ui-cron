import { expect, screen, userEvent, waitFor, within } from '@storybook/test';
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

  // Verify default cron
  const cronInput = await canvas.findByDisplayValue('0 0 * * *');
  expect(cronInput).toBeInTheDocument();

  // Change minute At/Every to "every" and select 15 -> "*/15 0 * * *"
  const minuteAtEvery = await canvas.findByLabelText('At/Every');
  await userEvent.click(minuteAtEvery);
  const everyOpt = await screen.findByRole('option', { name: 'every' });
  await userEvent.click(everyOpt);

  const minuteSelect = await canvas.findByLabelText('Minute(s)');
  await userEvent.click(minuteSelect);
  const step15 = await screen.findByRole('option', { name: '15' });
  await userEvent.click(step15);
  await waitFor(() => expect(canvas.getByDisplayValue('*/15 0 * * *')).toBeInTheDocument());

  // Reset button resets to default "0 0 * * *"
  const cronInputEl = canvas.getByRole('textbox');
  const resetButton = cronInputEl.parentElement?.querySelector('button');
  if (!resetButton) throw new Error('Reset button not found');
  await userEvent.click(resetButton);
  await waitFor(() => expect(canvas.getByDisplayValue('0 0 * * *')).toBeInTheDocument());
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
  const cronInput = await canvas.findByDisplayValue('0 0 * * *');
  expect(cronInput).toBeDisabled();

  const minuteMode = await canvas.findByLabelText('At/Every');
  await userEvent.click(minuteMode);
  const everyOpt = await screen.findByRole('option', { name: 'every' });
  expect(everyOpt).toHaveAttribute('aria-disabled', 'true');
};

function SchedulerPropChangeDemo() {
  const [cronExp, setCronExp] = React.useState('0 0 * * *');
  const [, setCronError] = React.useState('');
  return (
    <div>
      <button type="button" onClick={() => setCronExp('*/5 * * * *')}>Apply */5 * * * *</button>
      <Scheduler cron={cronExp} setCron={setCronExp} setCronError={setCronError} isAdmin />
    </div>
  );
}

export const PropChange = () => <SchedulerPropChangeDemo />;

PropChange.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const btn = await canvas.findByRole('button', { name: 'Apply */5 * * * *' });
  await userEvent.click(btn);
  await waitFor(() => expect(canvas.getByDisplayValue('*/5 * * * *')).toBeInTheDocument());
};
