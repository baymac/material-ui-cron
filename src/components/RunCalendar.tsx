import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React from 'react';
import { useAtomValue } from 'jotai';
import { cronExpState } from '../selector';
import { cronValidationErrorMessageState, localeState } from '../store';
import { bucketRunsByDay, computeNextRuns, formatTime, localeToBcp47 } from '../nextRuns';
import { localeString } from '../localization/strings';

// How many upcoming occurrences to fetch for the calendar. Enough to populate a
// dense month (and to page a few months ahead for sparser schedules) without
// computing an unbounded list for a once-a-year cron.
const RUN_COUNT = 50;

const Panel = styled(Box)(({ theme }) => ({
  padding: '18px 20px',
  backgroundColor: theme.palette.action.hover,
  borderTop: `1px solid ${theme.palette.divider}`,
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

const NavButton = styled(IconButton)({ padding: 2, fontSize: 16, lineHeight: 1 });

const Grid = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: 2,
});

const Weekday = styled('div')(({ theme }) => ({
  fontSize: 10,
  fontWeight: 600,
  textAlign: 'center',
  color: theme.palette.text.secondary,
  paddingBottom: 2,
}));

const Day = styled('div')<{ 'data-has-runs'?: string }>(({ theme }) => ({
  aspectRatio: '1 / 1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12,
  borderRadius: 6,
  color: theme.palette.text.primary,
  '&[data-has-runs="true"]': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: 600,
    cursor: 'default',
  },
}));

const Message = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: 13.5,
}));

interface RunCalendarProps {
  timezone?: string;
}

// Sunday-first narrow weekday initials for `localeTag` (Jan 1 2023 is a Sunday).
function weekdayInitials(localeTag: string): string[] {
  const fmt = new Intl.DateTimeFormat(localeTag, { weekday: 'narrow', timeZone: 'UTC' });
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(Date.UTC(2023, 0, 1 + i))));
}

export default function RunCalendar({ timezone }: RunCalendarProps) {
  const cronExp = useAtomValue(cronExpState);
  const validationError = useAtomValue(cronValidationErrorMessageState);
  const locale = useAtomValue(localeState);
  const localeTag = localeToBcp47(locale.cronDescriptionText);

  // Absolute occurrences, recomputed only when cron / validity / timezone change
  // (mirrors NextRuns). computeNextRuns lazy-loads cron-parser, so it's async;
  // a `cancelled` flag drops a stale resolution.
  const [runs, setRuns] = React.useState<Date[]>([]);
  React.useEffect(() => {
    if (validationError.length > 0) {
      setRuns([]);
      return;
    }
    let cancelled = false;
    computeNextRuns(cronExp, RUN_COUNT, { timezone }).then((next) => {
      if (!cancelled) {
        setRuns(next);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [cronExp, validationError, timezone]);

  const buckets = React.useMemo(() => bucketRunsByDay(runs, timezone), [runs, timezone]);
  // Distinct `YYYY-MM` months that actually contain runs, ascending — paging
  // only ever visits months that have something to show.
  const months = React.useMemo(
    () => [...new Set([...buckets.keys()].map((day) => day.slice(0, 7)))].sort(),
    [buckets],
  );

  const [cursor, setCursor] = React.useState(0);
  React.useEffect(() => setCursor(0), [months]);
  const safeCursor = Math.min(cursor, Math.max(months.length - 1, 0));

  const weekdays = React.useMemo(() => weekdayInitials(localeTag), [localeTag]);

  return (
    <Panel>
      <Header>
        <PanelLabel>{localeString(locale, 'calendarLabel')}</PanelLabel>
        {months.length > 1 && (
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
        )}
      </Header>

      {validationError.length > 0 ? (
        <Message>{localeString(locale, 'invalidScheduleText')}</Message>
      ) : months.length === 0 ? (
        <Message>{localeString(locale, 'noUpcomingRunsText')}</Message>
      ) : (
        <MonthGrid
          ym={months[safeCursor]}
          weekdays={weekdays}
          buckets={buckets}
          localeTag={localeTag}
          timezone={timezone}
        />
      )}
    </Panel>
  );
}

function monthLabel(ym: string, localeTag: string): string {
  const [year, month] = ym.split('-').map(Number);
  return new Intl.DateTimeFormat(localeTag, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

interface MonthGridProps {
  ym: string;
  weekdays: string[];
  buckets: Map<string, Date[]>;
  localeTag: string;
  timezone?: string;
}

function MonthGrid({ ym, weekdays, buckets, localeTag, timezone }: MonthGridProps) {
  const [year, month] = ym.split('-').map(Number);
  const monthIdx = month - 1;
  // Weekday/day counts are properties of the abstract calendar month, so they're
  // computed in UTC (timezone-independent); the run buckets were already keyed in
  // the target timezone.
  const firstWeekday = new Date(Date.UTC(year, monthIdx, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, monthIdx + 1, 0)).getUTCDate();

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstWeekday; i++) {
    cells.push(<Day key={`blank-${i}`} aria-hidden='true' />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${ym}-${String(day).padStart(2, '0')}`;
    const dayRuns = buckets.get(key);
    if (dayRuns && dayRuns.length > 0) {
      const times = dayRuns.map((d) => formatTime(d, localeTag, timezone)).join(', ');
      cells.push(
        <Day
          key={key}
          data-has-runs='true'
          title={times}
          aria-label={`${day}: ${dayRuns.length} run${dayRuns.length > 1 ? 's' : ''} (${times})`}
        >
          {day}
        </Day>,
      );
    } else {
      cells.push(<Day key={key}>{day}</Day>);
    }
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
