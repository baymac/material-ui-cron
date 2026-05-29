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

// Regression test for #19: `0 1/4 * * *` (plain `n/m` step in the hour part)
// used to be rejected with "Incorrect syntax hypen".
function SchedulerStepValueDemo() {
  const [cronExp, setCronExp] = React.useState('0 0 * * *');
  const [, setCronError] = React.useState('');
  return <Scheduler cron={cronExp} setCron={setCronExp} setCronError={setCronError} isAdmin />;
}

export const StepValue = () => <SchedulerStepValueDemo />;

StepValue.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const user = userEvent.setup();

  const input = await canvas.findByDisplayValue('0 0 * * *');
  await user.clear(input);
  await user.type(input, '0 1/4 * * *');

  // The text field reflects the typed value immediately.
  await waitFor(() => expect(canvas.getByDisplayValue('0 1/4 * * *')).toBeInTheDocument());
  // After validation (debounced) there must be no error for this valid expression.
  await waitFor(
    () => expect(canvas.queryByText(/Invalid hour cron part/i)).not.toBeInTheDocument(),
    { timeout: 2000 },
  );
};

// Regression test for #20: changing the cron prop to a broader expression must
// reset the period instead of staying stuck on the previous (narrower) one.
function SchedulerPropChangeToBroaderDemo() {
  const [cronExp, setCronExp] = React.useState('30 9 * * 1');
  const [, setCronError] = React.useState('');
  return (
    <div>
      <button type='button' onClick={() => setCronExp('* * * * *')}>
        Apply * * * * *
      </button>
      <Scheduler cron={cronExp} setCron={setCronExp} setCronError={setCronError} isAdmin />
    </div>
  );
}

export const PropChangeToBroader = () => <SchedulerPropChangeToBroaderDemo />;

PropChangeToBroader.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const user = userEvent.setup();

  // Starts as a weekly schedule.
  await waitFor(() => expect(canvas.getByLabelText('Period')).toHaveValue('week'), {
    timeout: 2000,
  });

  const btn = await canvas.findByRole('button', { name: 'Apply * * * * *' });
  await user.click(btn);

  await waitFor(() => expect(canvas.getByDisplayValue('* * * * *')).toBeInTheDocument(), {
    timeout: 2000,
  });
  // Period must fall back to the broadest value rather than remaining on "week".
  await waitFor(() => expect(canvas.getByLabelText('Period')).toHaveValue('hour'), {
    timeout: 2000,
  });
};
