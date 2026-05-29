import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
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
    // Field value controls are now chips/steppers; the field name lives in the
    // FieldRow label.
    expect(screen.getByText('Minute(s)')).toBeInTheDocument();
    expect(screen.getByText('Hour(s)')).toBeInTheDocument();
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
    expect(screen.getByText('Month(s)')).toBeInTheDocument();
    expect(screen.getByText('Day of the Month')).toBeInTheDocument();
    expect(screen.getByText('Hour(s)')).toBeInTheDocument();
  });

  it('renders a day-of-month range expression', async () => {
    render(<Scheduler cron='0 0 1-15 * *' setCron={noop} setCronError={noop} isAdmin />);
    await waitFor(() => expect(periodValue()).toBe('month'), { timeout: 3000 });
    expect(await screen.findByDisplayValue('0 0 1-15 * *')).toBeInTheDocument();
  });

  it('renders a weekday range expression', async () => {
    render(<Scheduler cron='0 9 * * 1-5' setCron={noop} setCronError={noop} isAdmin />);
    await waitFor(() => expect(periodValue()).toBe('week'), { timeout: 3000 });
    expect(screen.getByText('Day of the week')).toBeInTheDocument();
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
  it('keeps the disabled cron-input text legible (#18)', async () => {
    render(<Scheduler cron='0 0 * * *' setCron={noop} setCronError={noop} isAdmin={false} />);
    const input = (await screen.findByDisplayValue('0 0 * * *')) as HTMLInputElement;
    expect(input).toBeDisabled();
    // Theme-aware redesign: the field no longer hardcodes white. The #18
    // guarantee is *legibility* — the disabled read-only text must not render
    // transparent (which is how MUI greys out disabled inputs by default).
    const fill = getComputedStyle(input).webkitTextFillColor;
    expect(fill).not.toBe('rgba(0, 0, 0, 0)');
    expect(fill).not.toBe('transparent');
    expect(fill).toBeTruthy();
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

// ---- Redesign PR1: header + Next-runs panel + layout ----
describe('Scheduler redesign (browser)', () => {
  it('renders the Schedule header with the cron expression', async () => {
    render(<Scheduler cron='0 0 * * *' setCron={noop} setCronError={noop} isAdmin />);
    expect(await screen.findByText('Schedule')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('0 0 * * *')).toBeInTheDocument();
  });

  it('renders 5 occurrence rows in the Next-runs panel for a valid cron', async () => {
    render(<Scheduler cron='*/2 * * * *' setCron={noop} setCronError={noop} isAdmin />);
    const list = await screen.findByRole('list', { name: 'Next runs' }, { timeout: 3000 });
    // Always renders 5 in the DOM; the container query CSS-hides rows 4-5 at
    // narrow widths (querySelectorAll counts hidden nodes, unlike role queries).
    await waitFor(() => expect(list.querySelectorAll('li')).toHaveLength(5));
  });

  it('shows the invalid-schedule message when the cron becomes invalid', async () => {
    render(<Scheduler cron='0 0 * * *' setCron={noop} setCronError={noop} isAdmin />);
    const input = await screen.findByDisplayValue('0 0 * * *');
    // Typed invalid input persists the error (an initial *invalid* prop would be
    // bounced back to the field-derived value by the two-way sync).
    fireEvent.change(input, { target: { value: '60 * * * *' } });
    await waitFor(
      () => expect(screen.getByText(/Enter a valid schedule to preview runs/i)).toBeInTheDocument(),
      { timeout: 3000 },
    );
    expect(screen.queryByRole('list', { name: 'Next runs' })).not.toBeInTheDocument();
  });

  it('shows "No upcoming runs" for a valid cron that never fires (Feb 30)', async () => {
    render(<Scheduler cron='0 0 30 2 *' setCron={noop} setCronError={noop} isAdmin />);
    await waitFor(() => expect(screen.getByText(/No upcoming runs/i)).toBeInTheDocument(), {
      timeout: 3000,
    });
  });

  it('localizes the Next-runs label (zh_CN)', async () => {
    render(<Scheduler cron='*/2 * * * *' setCron={noop} setCronError={noop} isAdmin locale='zh_CN' />);
    expect(await screen.findByText('接下来的运行')).toBeInTheDocument();
  });

  it('keeps copy available to everyone but reset admin-gated (non-admin)', async () => {
    render(<Scheduler cron='0 0 * * *' setCron={noop} setCronError={noop} isAdmin={false} />);
    // Copy is read-only/safe -> enabled for non-admins.
    expect(await screen.findByRole('button', { name: 'Copy' })).toBeEnabled();
    // Reset mutates the schedule -> disabled for non-admins.
    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled();
  });

  it('enables reset for admins', async () => {
    render(<Scheduler cron='0 0 * * *' setCron={noop} setCronError={noop} isAdmin />);
    expect(await screen.findByRole('button', { name: 'Reset' })).toBeEnabled();
  });

  it('renders under a dark + RTL theme without breaking', async () => {
    const theme = createTheme({ palette: { mode: 'dark' }, direction: 'rtl' });
    render(
      <ThemeProvider theme={theme}>
        <Scheduler cron='*/2 * * * *' setCron={noop} setCronError={noop} isAdmin />
      </ThemeProvider>,
    );
    expect(await screen.findByDisplayValue('*/2 * * * *')).toBeInTheDocument();
    expect(await screen.findByText('Schedule')).toBeInTheDocument();
    const list = await screen.findByRole('list', { name: 'Next runs' }, { timeout: 3000 });
    expect(within(list).getAllByRole('listitem').length).toBeGreaterThan(0);
  });
});

// ---- Mode selectors: At/Every is the (reverted) dropdown; On/Every is a pill ----
describe('Scheduler mode selectors (browser)', () => {
  it('renders the At/Every selector as a dropdown for minute and hour', async () => {
    render(<Scheduler cron='0 0 * * *' setCron={noop} setCronError={noop} isAdmin />);
    // A `day` cron reveals the Hour + Minute rows; each carries an At/Every
    // dropdown (an Autocomplete labelled "At/Every"), not a pill toggle.
    await waitFor(() => expect(screen.getAllByLabelText('At/Every')).toHaveLength(2));
  });

  it('renders the day-of-month On/Every selector as a segmented toggle', async () => {
    render(<Scheduler cron='0 0 5 * *' setCron={noop} setCronError={noop} isAdmin />);
    const group = await screen.findByRole('group', { name: 'On/Every' });
    expect(within(group).getByRole('button', { name: 'on' })).toBeInTheDocument();
    expect(within(group).getByRole('button', { name: 'every' })).toBeInTheDocument();
  });
});

// ---- PR3: value controls swapped to steppers + chip-pickers + toggle chips ----
describe('Scheduler field value controls (browser)', () => {
  const cronField = () => screen.getByLabelText('cron expression') as HTMLInputElement;

  it('steps the every-hour interval up via the stepper', async () => {
    const user = userEvent.setup();
    render(<Scheduler cron='0 */4 * * *' setCron={noop} setCronError={noop} isAdmin />);
    expect(await screen.findByDisplayValue('0 */4 * * *')).toBeInTheDocument();

    // The prop is parsed into every-mode after the header's debounce, which is
    // when the stepper (and its increment button) mounts — wait for it.
    const increment = await screen.findByRole(
      'button',
      { name: 'Hour(s) increment' },
      { timeout: 3000 },
    );
    await user.click(increment);

    // Interval 4 -> 5; full-range every-mode serialises as `*/5`.
    await waitFor(() => expect(cronField().value).toBe('0 */5 * * *'));
  });

  it('adds a minute via the chip-picker add menu', async () => {
    const user = userEvent.setup();
    render(<Scheduler cron='0 0 * * *' setCron={noop} setCronError={noop} isAdmin />);
    expect(await screen.findByDisplayValue('0 0 * * *')).toBeInTheDocument();

    const minuteGroup = await screen.findByRole('group', { name: 'Minute(s)' });
    await user.click(within(minuteGroup).getByRole('button', { name: 'Add' }));
    await user.click(await screen.findByRole('menuitem', { name: '5' }));

    // Minutes {0,5} are non-contiguous -> comma list.
    await waitFor(() => expect(cronField().value).toBe('0,5 0 * * *'));
  });

  it('toggles a weekday chip and updates the cron', async () => {
    const user = userEvent.setup();
    render(<Scheduler cron='0 9 * * 1-5' setCron={noop} setCronError={noop} isAdmin />);
    await waitFor(() => expect(periodValue()).toBe('week'), { timeout: 3000 });

    const weekGroup = await screen.findByRole('group', { name: 'Week Days' });
    // Add Saturday (Mon–Fri -> Mon–Sat = 1-6 contiguous range).
    await user.click(within(weekGroup).getByRole('button', { name: 'SATURDAY' }));
    await waitFor(() => expect(cronField().value).toBe('0 9 * * 1-6'));
  });
});

// ---- Per-instance state: two schedulers on a page must not share atoms ----
describe('Scheduler instance isolation (browser)', () => {
  it('keeps two Scheduler instances independent', async () => {
    render(
      <>
        <Scheduler cron='0 0 * * *' setCron={noop} setCronError={noop} isAdmin />
        <Scheduler cron='30 9 * * 1' setCron={noop} setCronError={noop} isAdmin />
      </>,
    );
    // With module-global atoms the two instances would stomp each other and
    // both periods would read the same value; the per-instance Provider keeps
    // them separate (one `day`, one `week`).
    await waitFor(() => {
      const periods = screen.getAllByLabelText('Period') as HTMLInputElement[];
      expect(periods).toHaveLength(2);
      expect(periods.map((p) => p.value).sort()).toEqual(['day', 'week']);
    });
  });
});
