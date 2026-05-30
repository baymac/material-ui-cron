import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useAtomValue } from 'jotai';
import React from 'react';
import { localeString } from '../localization/strings';
import {
  addMonths,
  computeRunDays,
  computeRunsOnDay,
  formatDayKey,
  formatRelative,
  formatTime,
  localeToBcp47,
  monthKeyInTz,
} from '../nextRuns';
import { cronExpState } from '../selector';
import { cronValidationErrorMessageState, localeState } from '../store';

// The calendar window: the current month plus the next two. Users can page
// across these three months (never before the current one). `MONTH_SPAN` is the
// count of months SHOWN; `WINDOW_MONTHS` is how far ahead we enumerate runs.
const MONTH_SPAN = 3;
// Enumerate every run from now to the end of the last shown month so each firing
// day is marked — not a fixed-size prefix. computeRunsUntil caps the list, so a
// once-a-minute cron can't blow up; days past the cap simply go unmarked.
const WINDOW_MONTHS = MONTH_SPAN;
// Relative-time labels re-render on this cadence (the per-day list). Occurrences
// are NOT recomputed here (see the compute effect).
const TICK_MS = 30_000;

const Panel = styled(Box)(({ theme }) => ({
  padding: '18px 20px',
  backgroundColor: theme.palette.action.hover,
}));

const Header = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 12,
});

const PanelLabel = styled(Typography)(({ theme }) => ({
  fontSize: 11,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  fontWeight: 600,
  color: theme.palette.text.secondary,
}));

const MonthNav = styled(Box)({ display: 'flex', alignItems: 'center', gap: 2 });

const MonthLabel = styled(Typography)({
  fontSize: 12.5,
  fontWeight: 600,
  minWidth: 96,
  textAlign: 'center',
});

// Roomy hit area for the month arrows — the glyph is small, so padding does the
// work of making the whole ~32px square clickable.
const NavButton = styled(IconButton)({ padding: 8, fontSize: 16, lineHeight: 1 });

const Grid = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  // Generous gap so circular day cells breathe and a selected ring never bleeds
  // into the neighbouring cell.
  gap: 6,
});

const Weekday = styled('div')(({ theme }) => ({
  fontSize: 10,
  fontWeight: 600,
  textAlign: 'center',
  color: theme.palette.text.secondary,
  paddingBottom: 2,
}));

// A day cell is a real button so it's keyboard-operable: days with runs are
// filled with the accent color, the selected day gets a ring, and clicking any
// day (run or not) filters the list below to it.
const Day = styled('button')(({ theme }) => ({
  appearance: 'none',
  border: 0,
  background: 'transparent',
  font: 'inherit',
  padding: 0,
  aspectRatio: '1 / 1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12,
  borderRadius: '50%',
  color: theme.palette.text.primary,
  cursor: 'pointer',
  '&:hover': { backgroundColor: theme.palette.action.selected },
  '&[data-blank="true"]': { visibility: 'hidden', cursor: 'default' },
  '&[data-has-runs="true"]': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: 600,
  },
  '&[data-has-runs="true"]:hover': { backgroundColor: theme.palette.primary.dark },
  // Selection is a ring sitting OUTSIDE the circle, with a gap (the panel
  // background shows through `outlineOffset`) so it reads even on a filled
  // highlighted day, and the grid gap keeps it clear of the neighbouring cell.
  '&[data-selected="true"]': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },
}));

const DayHeading = styled(Typography)(({ theme }) => ({
  marginTop: 14,
  fontSize: 12,
  fontWeight: 600,
  color: theme.palette.text.secondary,
}));

// A busy day (e.g. an every-few-minutes cron) can have dozens of runs; cap the
// visible list at MAX_VISIBLE_RUNS rows and scroll the rest. Each row is a fixed
// RUN_ROW_HEIGHT (border-box) so the cap is an exact pixel height.
const MAX_VISIBLE_RUNS = 5;
const RUN_ROW_HEIGHT = 36;

const RunList = styled('ul')({
  listStyle: 'none',
  margin: '8px 0 0',
  padding: 0,
  maxHeight: MAX_VISIBLE_RUNS * RUN_ROW_HEIGHT,
  overflowY: 'auto',
});

const RunRow = styled('li')(({ theme }) => ({
  boxSizing: 'border-box',
  height: RUN_ROW_HEIGHT,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  fontSize: 13.5,
  borderTop: `1px solid ${theme.palette.divider}`,
  '&:first-of-type': { borderTop: 0 },
}));

const When = styled('span')({ fontWeight: 500 });

const Relative = styled('span')(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: 12.5,
  whiteSpace: 'nowrap',
}));

const Message = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: 13.5,
}));

interface NextRunsProps {
  timezone?: string;
}

// Sunday-first narrow weekday initials for `localeTag` (Jan 1 2023 is a Sunday).
function weekdayInitials(localeTag: string): string[] {
  const fmt = new Intl.DateTimeFormat(localeTag, { weekday: 'narrow', timeZone: 'UTC' });
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(Date.UTC(2023, 0, 1 + i))));
}

function monthLabel(ym: string, localeTag: string): string {
  const [year, month] = ym.split('-').map(Number);
  return new Intl.DateTimeFormat(localeTag, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export default function NextRuns({ timezone }: NextRunsProps) {
  const cronExp = useAtomValue(cronExpState);
  const validationError = useAtomValue(cronValidationErrorMessageState);
  const locale = useAtomValue(localeState);
  const localeTag = localeToBcp47(locale.cronDescriptionText);

  // Ticking wall-clock for relative labels only — kept out of the occurrence
  // computation so we don't re-parse the cron every 30s.
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  // The calendar days (ISO `YYYY-MM-DD`, ascending) that fire inside the visible
  // window, plus the `anchor` they were computed from (so the month strip aligns
  // with the same "current month"). Only DAY-level marking is computed here — not
  // every occurrence — so a dense cron (e.g. every minute) can't blow up or get
  // capped into dropping whole months off the far end. Recomputed only when the
  // cron / validity / timezone change; gated behind the library's validator and
  // guarded inside computeRunDays. The horizon is the start of the month AFTER
  // the last shown one, with a one-day buffer so a timezone behind UTC doesn't
  // clip the last day's late runs.
  const [{ days, anchor }, setData] = React.useState<{ days: string[]; anchor: Date }>(() => ({
    days: [],
    anchor: new Date(),
  }));
  React.useEffect(() => {
    const at = new Date();
    if (validationError.length > 0) {
      setData({ days: [], anchor: at });
      return;
    }
    let cancelled = false;
    const startYm = monthKeyInTz(at, timezone);
    const horizonYm = addMonths(startYm, WINDOW_MONTHS);
    const [hy, hm] = horizonYm.split('-').map(Number);
    const horizon = new Date(Date.UTC(hy, hm - 1, 2));
    computeRunDays(cronExp, horizon, { timezone, anchor: at }).then((next) => {
      if (!cancelled) {
        setData({ days: next, anchor: at });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [cronExp, validationError, timezone]);

  const daySet = React.useMemo(() => new Set(days), [days]);
  // The three months on offer, current first — a fixed strip regardless of where
  // the runs fall.
  const months = React.useMemo(() => {
    const start = monthKeyInTz(anchor, timezone);
    return Array.from({ length: MONTH_SPAN }, (_, i) => addMonths(start, i));
  }, [anchor, timezone]);

  const weekdays = React.useMemo(() => weekdayInitials(localeTag), [localeTag]);

  // On a fresh schedule, jump to the month of the soonest run and pre-select that
  // day so the list isn't empty; if nothing runs in the window, fall back to the
  // current month with no selection.
  const [cursor, setCursor] = React.useState(0);
  const [selectedDay, setSelectedDay] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (days.length === 0) {
      setCursor(0);
      setSelectedDay(null);
      return;
    }
    const firstDay = days[0];
    setSelectedDay(firstDay);
    const idx = months.indexOf(firstDay.slice(0, 7));
    setCursor(idx >= 0 ? idx : 0);
    // Reset only when the firing-day set itself changes (new cron / tz), not on
    // every render that recreates `months`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  // The actual run times for the SELECTED day only — computed on demand (a cheap
  // single-day window) rather than up front for every day in the window. Tagged
  // with the day they belong to so a slow async result never paints onto a
  // different day the user has since clicked. A day that isn't in `daySet` has no
  // runs by definition, so we resolve it to `[]` synchronously (no parser hop,
  // no stale-list flash); only firing days take the async path.
  const [selectedRuns, setSelectedRuns] = React.useState<{ day: string; runs: Date[] } | null>(
    null,
  );
  React.useEffect(() => {
    if (!selectedDay || validationError.length > 0) {
      setSelectedRuns(null);
      return;
    }
    if (!daySet.has(selectedDay)) {
      setSelectedRuns({ day: selectedDay, runs: [] });
      return;
    }
    let cancelled = false;
    computeRunsOnDay(cronExp, selectedDay, { timezone }).then((next) => {
      if (!cancelled) {
        setSelectedRuns({ day: selectedDay, runs: next });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [cronExp, validationError, timezone, selectedDay, daySet]);

  const safeCursor = Math.min(cursor, months.length - 1);
  // Only trust the resolved runs once they match the currently selected day; a
  // firing day that's still computing reads `undefined` (heading only, no flash).
  const selectedDayRuns =
    selectedRuns && selectedRuns.day === selectedDay ? selectedRuns.runs : undefined;

  return (
    <Panel>
      <Header>
        <PanelLabel>{localeString(locale, 'nextRunsLabel')}</PanelLabel>
        <MonthNav>
          <NavButton
            size='small'
            aria-label='Previous month'
            disabled={safeCursor === 0}
            onClick={() => setCursor((c) => Math.max(c - 1, 0))}
          >
            ‹
          </NavButton>
          <MonthLabel>{monthLabel(months[safeCursor], localeTag)}</MonthLabel>
          <NavButton
            size='small'
            aria-label='Next month'
            disabled={safeCursor >= months.length - 1}
            onClick={() => setCursor((c) => Math.min(c + 1, months.length - 1))}
          >
            ›
          </NavButton>
        </MonthNav>
      </Header>

      {validationError.length > 0 ? (
        <Message>{localeString(locale, 'invalidScheduleText')}</Message>
      ) : (
        <>
          <MonthGrid
            ym={months[safeCursor]}
            weekdays={weekdays}
            daySet={daySet}
            localeTag={localeTag}
            selectedDay={selectedDay}
            onSelect={setSelectedDay}
          />
          {days.length === 0 ? (
            <DayHeading sx={{ marginTop: '14px' }}>
              {localeString(locale, 'noUpcomingRunsText')}
            </DayHeading>
          ) : (
            selectedDay && (
              <>
                <DayHeading>{formatDayKey(selectedDay, localeTag)}</DayHeading>
                {selectedDayRuns === undefined ? null : selectedDayRuns.length === 0 ? (
                  <Message sx={{ marginTop: '6px' }}>
                    {localeString(locale, 'noRunsOnDayText')}
                  </Message>
                ) : (
                  <RunList aria-label={formatDayKey(selectedDay, localeTag)}>
                    {selectedDayRuns.map((date) => (
                      <RunRow key={date.toISOString()}>
                        <When>{formatTime(date, localeTag, timezone)}</When>
                        <Relative>{formatRelative(date, now, localeTag)}</Relative>
                      </RunRow>
                    ))}
                  </RunList>
                )}
              </>
            )
          )}
        </>
      )}
    </Panel>
  );
}

interface MonthGridProps {
  ym: string;
  weekdays: string[];
  daySet: Set<string>;
  localeTag: string;
  selectedDay: string | null;
  onSelect: (day: string) => void;
}

function MonthGrid({ ym, weekdays, daySet, localeTag, selectedDay, onSelect }: MonthGridProps) {
  const [year, month] = ym.split('-').map(Number);
  const monthIdx = month - 1;
  // Weekday/day counts are properties of the abstract calendar month, so they're
  // computed in UTC (timezone-independent); the run buckets were already keyed in
  // the target timezone.
  const firstWeekday = new Date(Date.UTC(year, monthIdx, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, monthIdx + 1, 0)).getUTCDate();

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstWeekday; i++) {
    cells.push(<Day key={`blank-${i}`} data-blank='true' disabled aria-hidden='true' />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${ym}-${String(day).padStart(2, '0')}`;
    const hasRuns = daySet.has(key);
    const isSelected = key === selectedDay;
    // Day-level marking only carries "fires / doesn't" — the exact count lives in
    // the per-day list below, computed when a day is selected.
    const label = hasRuns ? `${day}: has runs` : `${day}: no runs`;
    cells.push(
      <Day
        key={key}
        type='button'
        data-has-runs={hasRuns ? 'true' : undefined}
        data-selected={isSelected ? 'true' : undefined}
        aria-pressed={isSelected}
        aria-label={label}
        onClick={() => onSelect(key)}
      >
        {day}
      </Day>,
    );
  }

  return (
    <Grid role='grid' aria-label={monthLabel(ym, localeTag)}>
      {weekdays.map((w, i) => (
        <Weekday key={`wd-${i}`} aria-hidden='true'>
          {w}
        </Weekday>
      ))}
      {cells}
    </Grid>
  );
}
