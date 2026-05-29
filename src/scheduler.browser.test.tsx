import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Scheduler from './index';

const noop = () => {};

afterEach(() => {
  // Unmounting runs Scheduler's reset effect, restoring the shared Jotai atoms.
  cleanup();
});

const periodValue = () => (screen.getByLabelText('Period') as HTMLInputElement).value;

describe('Scheduler (browser)', () => {
  it('renders the default expression and core fields', async () => {
    render(<Scheduler cron='0 0 * * *' setCron={noop} setCronError={noop} isAdmin />);

    expect(await screen.findByDisplayValue('0 0 * * *')).toBeInTheDocument();
    await waitFor(() => expect(periodValue()).toBe('day'));
    expect(screen.getByLabelText('Minute(s)')).toBeInTheDocument();
    expect(screen.getByLabelText('Hour(s)')).toBeInTheDocument();
  });

  it('disables the cron input for non-admins', async () => {
    render(<Scheduler cron='0 0 * * *' setCron={noop} setCronError={noop} isAdmin={false} />);
    expect(await screen.findByDisplayValue('0 0 * * *')).toBeDisabled();
  });

  it('reports the cron expression back through setCron', async () => {
    const setCron = vi.fn();
    render(<Scheduler cron='0 0 * * *' setCron={setCron} setCronError={noop} isAdmin />);
    await waitFor(() => expect(setCron).toHaveBeenCalledWith('0 0 * * *'));
  });

  // ---- #19: `0 1/4 * * *` must be accepted ----
  it('accepts a plain n/m step expression without error (#19)', async () => {
    const setCronError = vi.fn();
    render(<Scheduler cron='0 0 * * *' setCron={noop} setCronError={setCronError} isAdmin />);

    const input = await screen.findByDisplayValue('0 0 * * *');
    fireEvent.change(input, { target: { value: '0 1/4 * * *' } });

    // The value is parsed and normalised (1/4 -> the equivalent 1-23/4). What
    // matters for #19 is that it validates cleanly: no error surfaces.
    await waitFor(() => expect(setCronError).toHaveBeenLastCalledWith(''), { timeout: 3000 });
    expect(screen.queryByText(/Invalid .* cron part/i)).not.toBeInTheDocument();
  });

  it('still flags a genuinely invalid expression', async () => {
    const setCronError = vi.fn();
    render(<Scheduler cron='0 0 * * *' setCron={noop} setCronError={setCronError} isAdmin />);

    const input = await screen.findByDisplayValue('0 0 * * *');
    fireEvent.change(input, { target: { value: '60 * * * *' } });

    await waitFor(
      () => expect(setCronError).toHaveBeenLastCalledWith(expect.stringMatching(/Invalid minute/i)),
      { timeout: 3000 },
    );
  });

  // ---- #20: changing the prop to a broader cron resets the period ----
  it('resets the period when the cron prop broadens (#20)', async () => {
    const { rerender } = render(
      <Scheduler cron='30 9 * * 1' setCron={noop} setCronError={noop} isAdmin />,
    );
    await waitFor(() => expect(periodValue()).toBe('week'), { timeout: 3000 });

    rerender(<Scheduler cron='* * * * *' setCron={noop} setCronError={noop} isAdmin />);
    await waitFor(() => expect(screen.getByDisplayValue('* * * * *')).toBeInTheDocument(), {
      timeout: 3000,
    });
    await waitFor(() => expect(periodValue()).toBe('hour'), { timeout: 3000 });
  });

  it('still widens the period when the prop narrows', async () => {
    const { rerender } = render(
      <Scheduler cron='0 0 * * *' setCron={noop} setCronError={noop} isAdmin />,
    );
    await waitFor(() => expect(periodValue()).toBe('day'), { timeout: 3000 });

    rerender(<Scheduler cron='0 0 5 * *' setCron={noop} setCronError={noop} isAdmin />);
    await waitFor(() => expect(periodValue()).toBe('month'), { timeout: 3000 });
  });

  it('renders month and day-of-month fields for a yearly expression', async () => {
    render(<Scheduler cron='30 9 5 6 *' setCron={noop} setCronError={noop} isAdmin />);
    await waitFor(() => expect(periodValue()).toBe('year'), { timeout: 3000 });
    expect(screen.getByLabelText('Month(s)')).toBeInTheDocument();
    expect(screen.getByLabelText('Day of the Month')).toBeInTheDocument();
    expect(screen.getByLabelText('Hour(s)')).toBeInTheDocument();
  });

  it('renders a day-of-month range expression', async () => {
    render(<Scheduler cron='0 0 1-15 * *' setCron={noop} setCronError={noop} isAdmin />);
    await waitFor(() => expect(periodValue()).toBe('month'), { timeout: 3000 });
    expect(await screen.findByDisplayValue('0 0 1-15 * *')).toBeInTheDocument();
  });

  it('renders a weekday range expression', async () => {
    render(<Scheduler cron='0 9 * * 1-5' setCron={noop} setCronError={noop} isAdmin />);
    await waitFor(() => expect(periodValue()).toBe('week'), { timeout: 3000 });
    expect(screen.getByLabelText('Week Days')).toBeInTheDocument();
  });

  // ---- #16: single-value autocompletes close after a selection ----
  it('closes a single-value autocomplete after selecting an option (#16)', async () => {
    const user = userEvent.setup();
    render(<Scheduler cron='0 0 * * *' setCron={noop} setCronError={noop} isAdmin />);

    const periodInput = await screen.findByLabelText('Period');
    await user.click(periodInput);

    const listbox = await screen.findByRole('listbox');
    const weekOption = within(listbox).getByText('week');
    await user.click(weekOption);

    // The popup must close on selection (blurOnSelect for single selects).
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(periodValue()).toBe('week');
  });
});
