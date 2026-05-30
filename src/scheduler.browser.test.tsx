import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Scheduler from './index';

const noop = () => {};

afterEach(() => {
  // Each Scheduler owns a per-instance jotai store (Provider in SchedulerRoot),
  // so unmounting discards its state — no shared-atom reset needed.
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
    expect(screen.queryByText(/Enter a valid schedule/i)).not.toBeInTheDocument();
  });

  it('still flags a genuinely invalid expression', async () => {
    const setCronError = vi.fn();
    render(<Scheduler cron='0 0 * * *' setCron={noop} setCronError={setCronError} isAdmin />);

    const input = await screen.findByDisplayValue('0 0 * * *');
    fireEvent.change(input, { target: { value: '60 * * * *' } });

    await waitFor(
      () =>
        expect(setCronError).toHaveBeenLastCalledWith(
          expect.stringMatching(/Minute must be between 0 and 59/i),
        ),
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
    // between/and time-range selects (start defaults to 12 AM, end 11 PM).
    const startInput = await screen.findByDisplayValue('12 AM');
    await user.click(startInput);

    const listbox = await screen.findByRole('listbox');
    await user.click(within(listbox).getByText('2 AM'));

    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(screen.getByDisplayValue('2 AM')).toBeInTheDocument();
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

  it('overrides the header title via the title prop', async () => {
    render(
      <Scheduler
        cron='0 0 * * *'
        setCron={noop}
        setCronError={noop}
        isAdmin
        title='Backup schedule'
      />,
    );
    expect(await screen.findByText('Backup schedule')).toBeInTheDocument();
    expect(screen.queryByText('Schedule')).not.toBeInTheDocument();
  });

  it('title prop wins over the locale scheduleTitle', async () => {
    render(
      <Scheduler
        cron='0 0 * * *'
        setCron={noop}
        setCronError={noop}
        isAdmin
        locale='zh_CN'
        title='Custom'
      />,
    );
    expect(await screen.findByText('Custom')).toBeInTheDocument();
    expect(screen.queryByText('计划')).not.toBeInTheDocument();
  });

  it('recolors the accent (header bar) via the color prop', async () => {
    render(
      <Scheduler cron='0 0 * * *' setCron={noop} setCronError={noop} isAdmin color='#9c27b0' />,
    );
    const title = await screen.findByText('Schedule');
    // The header Bar paints its background from palette.primary.main, which the
    // color prop overrides. The title <h6> sits directly inside that bar div, so
    // the nearest div ancestor is the bar itself (rgb(156, 39, 176) === #9c27b0).
    const bar = title.closest('div') as HTMLElement;
    expect(bar).toBeTruthy();
    expect(getComputedStyle(bar).backgroundColor).toBe('rgb(156, 39, 176)');
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

// ---- PR2: At/Every (On/Every) selectors swapped to segmented pills ----
describe('Scheduler segmented controls (browser)', () => {
  it('renders the At/Every selector as a segmented toggle and switches mode on click', async () => {
    const user = userEvent.setup();
    render(<Scheduler cron='0 0 * * *' setCron={noop} setCronError={noop} isAdmin />);

    // A `day` cron reveals the Hour + Minute rows; each carries an At/Every
    // ToggleButtonGroup (role="group"). The first is Hour (render order).
    const groups = await screen.findAllByRole('group', { name: 'At/Every' });
    expect(groups).toHaveLength(2);

    const hourGroup = groups[0];
    expect(within(hourGroup).getByRole('button', { name: 'at' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    // Clicking "every" flips the mode end-to-end: the segment becomes pressed
    // and the derived cron (shown in the header field) moves off the every-hour
    // default into an interval expression.
    await user.click(within(hourGroup).getByRole('button', { name: 'every' }));
    await waitFor(() =>
      expect(within(hourGroup).getByRole('button', { name: 'every' })).toHaveAttribute(
        'aria-pressed',
        'true',
      ),
    );
    const cronField = screen.getByLabelText('cron expression') as HTMLInputElement;
    await waitFor(() => expect(cronField.value).not.toBe('0 0 * * *'));
    // Every-mode hour serialises to an interval expression (e.g. `*/1` or
    // `2-23/1`); both carry the step slash.
    expect(cronField.value).toMatch(/\//);
  });

  it('disables the "every" segment for non-admins', async () => {
    render(<Scheduler cron='0 0 * * *' setCron={noop} setCronError={noop} isAdmin={false} />);
    const groups = await screen.findAllByRole('group', { name: 'At/Every' });
    const everyButtons = groups.flatMap((group) =>
      within(group).getAllByRole('button', { name: 'every' }),
    );
    expect(everyButtons.length).toBeGreaterThan(0);
    everyButtons.forEach((button) => expect(button).toBeDisabled());
  });

  it('renders the day-of-month On/Every selector as a segmented toggle', async () => {
    render(<Scheduler cron='0 0 5 * *' setCron={noop} setCronError={noop} isAdmin />);
    const group = await screen.findByRole('group', { name: 'On/Every' });
    expect(within(group).getByRole('button', { name: 'on' })).toBeInTheDocument();
    expect(within(group).getByRole('button', { name: 'every' })).toBeInTheDocument();
  });

  // Regression: toggling a field to "every" while its value is 0 used to derive
  // an invalid `*/0` for one render (mode changed before the value was fixed),
  // flashing an "Invalid ... cron part" error before self-correcting. The mode
  // and a valid interval are now set in the same update.
  it('switching minute to "every" never flashes an invalid cron', async () => {
    const user = userEvent.setup();
    const setCronError = vi.fn();
    render(<Scheduler cron='0 0 * * *' setCron={noop} setCronError={setCronError} isAdmin />);
    await screen.findByDisplayValue('0 0 * * *');

    const groups = await screen.findAllByRole('group', { name: 'At/Every' });
    const cronField = screen.getByLabelText('cron expression') as HTMLInputElement;
    // Minute is the second At/Every group; its value here is "0".
    await user.click(within(groups[1]).getByRole('button', { name: 'every' }));

    // Settles directly on a valid interval, never `*/0`.
    await waitFor(() => expect(cronField.value).toMatch(/\*\/1 0 \* \* \*/));
    // Wait past the 500ms validation debounce: no invalid error ever surfaced.
    await new Promise((resolve) => setTimeout(resolve, 800));
    expect(setCronError).not.toHaveBeenCalledWith(expect.stringMatching(/invalid/i));
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
