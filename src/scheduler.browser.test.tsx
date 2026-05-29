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

  // #16 deeper audit: the issue specifically named the *time-range* selects.
  // Unlike Period, these recompute their option arrays on every selection
  // (Hour.tsx / Minute.tsx effects) — the re-render churn that used to keep the
  // popup mounted. This guards that blurOnSelect closes them despite that churn.
  it('closes a time-range autocomplete after selecting an option (#16)', async () => {
    const user = userEvent.setup();
    render(<Scheduler cron='0 */4 * * *' setCron={noop} setCronError={noop} isAdmin />);

    // `0 */4 * * *` puts the hour field in "every" mode, revealing the
    // between/and time-range selects (start defaults to 12:00 AM, end 11:00 PM).
    const startInput = await screen.findByDisplayValue('12:00 AM');
    await user.click(startInput);

    const listbox = await screen.findByRole('listbox');
    await user.click(within(listbox).getByText('02:00 AM'));

    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(screen.getByDisplayValue('02:00 AM')).toBeInTheDocument();
  });

  // #18: the linked upstream bug (mui/material-ui#27501) was a MUI 5 *beta*
  // regression. On MUI v7 it does not reproduce; these assertions lock in the
  // two styling behaviours the library actually maintains so a future MUI bump
  // can't silently regress them.
  it('keeps disabled cron-input text legible on the dark field (#18)', async () => {
    render(<Scheduler cron='0 0 * * *' setCron={noop} setCronError={noop} isAdmin={false} />);
    const input = (await screen.findByDisplayValue('0 0 * * *')) as HTMLInputElement;
    expect(input).toBeDisabled();
    // The component forces white text-fill on the disabled (read-only) input.
    expect(getComputedStyle(input).webkitTextFillColor).toBe('rgb(255, 255, 255)');
  });

  it('renders multi-select values as chips (#18)', async () => {
    render(<Scheduler cron='0 9 * * 1-5' setCron={noop} setCronError={noop} isAdmin />);
    await waitFor(() => expect(periodValue()).toBe('week'), { timeout: 3000 });
    // Mon–Fri render as MUI chips inside the Week Days field.
    expect(document.querySelectorAll('.MuiChip-root').length).toBeGreaterThan(0);
  });

  // #17 kitchen-sink coverage: a provided locale localizes the field labels.
  it('renders localized labels for a provided locale (zh_CN)', async () => {
    render(<Scheduler cron='0 0 * * *' setCron={noop} setCronError={noop} isAdmin locale='zh_CN' />);
    // Period label in zh_CN.
    await waitFor(() => expect(screen.getByLabelText('时间间隔')).toBeInTheDocument(), {
      timeout: 3000,
    });
  });

  // Regression: switching locale left the *selected value* one language behind
  // (period read "day" under Chinese; switching back read "天" under English)
  // because the shared atoms kept their stale localized labels. The fix
  // re-localizes selections onto the new locale's matching option by value.
  // Found by /qa on 2026-05-29.
  it('re-localizes the selected period when the locale changes (no stale lag)', async () => {
    const periodValueZh = () =>
      (screen.getByLabelText('时间间隔') as HTMLInputElement).value;

    const { rerender } = render(
      <Scheduler cron='0 0 1 * *' setCron={noop} setCronError={noop} isAdmin locale='en' />,
    );
    // Month-level cron -> period reads "month" in English.
    await waitFor(() => expect(periodValue()).toBe('month'), { timeout: 3000 });

    // Switch to Chinese: the selection is preserved and its label translates.
    rerender(<Scheduler cron='0 0 1 * *' setCron={noop} setCronError={noop} isAdmin locale='zh_CN' />);
    await waitFor(() => expect(periodValueZh()).toBe('月'), { timeout: 3000 });

    // Switch back to English: no Chinese lag — it reads "month" again.
    rerender(<Scheduler cron='0 0 1 * *' setCron={noop} setCronError={noop} isAdmin locale='en' />);
    await waitFor(() => expect(periodValue()).toBe('month'), { timeout: 3000 });
  });
});
