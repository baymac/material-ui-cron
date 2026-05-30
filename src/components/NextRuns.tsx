import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React from 'react';
import { useAtomValue } from 'jotai';
import { cronExpState } from '../selector';
import { cronValidationErrorMessageState, localeState } from '../store';
import { computeNextRuns, formatAbsolute, formatRelative, localeToBcp47 } from '../nextRuns';
import { localeString } from '../localization/strings';

const RUN_COUNT = 5;
// Mobile (stacked) only shows the first 3 rows. CSS hides 4-5 via the
// container query below — React still renders all 5 (occurrences are already
// computed), because a CSS container query cannot change the rendered count.
const MOBILE_VISIBLE = 3;
// Relative-time labels re-render on this cadence. Min/hour/day granularity
// needs nothing faster. Occurrences are NOT recomputed here (see useMemo).
const TICK_MS = 30_000;

const Panel = styled(Box)(({ theme }) => ({
  padding: '18px 20px',
  backgroundColor: theme.palette.action.hover,
}));

const PanelLabel = styled(Typography)(({ theme }) => ({
  fontSize: 11,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  fontWeight: 600,
  color: theme.palette.text.secondary,
  marginBottom: 12,
}));

const RunList = styled('ul')({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  // Hide rows beyond MOBILE_VISIBLE when the card is in its stacked width.
  [`@container (max-width: 720px)`]: {
    [`& > li:nth-of-type(n + ${MOBILE_VISIBLE + 1})`]: { display: 'none' },
  },
});

const RunRow = styled('li')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  gap: 12,
  padding: '9px 0',
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

export default function NextRuns({ timezone }: NextRunsProps) {
  const cronExp = useAtomValue(cronExpState);
  const validationError = useAtomValue(cronValidationErrorMessageState);
  const locale = useAtomValue(localeState);
  const localeTag = localeToBcp47(locale.cronDescriptionText);

  // Ticking wall-clock for relative labels only — kept out of the occurrence
  // memo so we don't re-parse the cron every 30s.
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  // Absolute occurrences: recomputed only when the cron / validity / timezone
  // change. Gated behind the library's validator (single source of truth) and
  // guarded inside computeNextRuns against cron-parser throwing. computeNextRuns
  // is async (it lazy-loads cron-parser as a separate chunk), so the result is
  // held in state; a `cancelled` flag drops a stale resolution if inputs change
  // before it settles.
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

  return (
    <Panel>
      <PanelLabel>{localeString(locale, 'nextRunsLabel')}</PanelLabel>
      {validationError.length > 0 ? (
        <Message>{localeString(locale, 'invalidScheduleText')}</Message>
      ) : runs.length === 0 ? (
        <Message>{localeString(locale, 'noUpcomingRunsText')}</Message>
      ) : (
        <RunList aria-label={localeString(locale, 'nextRunsLabel')}>
          {runs.map((date) => (
            <RunRow key={date.toISOString()}>
              <When>{formatAbsolute(date, localeTag, timezone)}</When>
              <Relative>{formatRelative(date, now, localeTag)}</Relative>
            </RunRow>
          ))}
        </RunList>
      )}
    </Panel>
  );
}
