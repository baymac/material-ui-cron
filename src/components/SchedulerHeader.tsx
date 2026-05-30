import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { styled } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import React from 'react';
import { useAtom, useAtomValue } from 'jotai';
import useDebounce from '../hooks/useDebounce';
import { cronExpState } from '../selector';
import { cronExpInputState, isAdminState, localeState } from '../store';
import { localeString } from '../localization/strings';

const Bar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  // Wrap on a narrow card so the cron field + copy/reset drop to a second row
  // instead of the action icons being pushed off the right edge (clipped).
  flexWrap: 'wrap',
  gap: 12,
  padding: '14px 18px',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

const Title = styled(Typography)({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontWeight: 600,
  fontSize: 15,
  // Grow to fill the row so the Actions group is pushed to the right on a wide
  // card. flex-grow only distributes leftover space on a non-wrapped line, so
  // it doesn't change where the group wraps — but it lets us drop the
  // `marginLeft: auto` that would otherwise right-shove the group on its own
  // wrapped (mobile) row, keeping the cron field's left edge aligned with the
  // title's calendar icon.
  flex: '1 1 auto',
});

// Cron expression field. Monospace, sits on the colored header, so its text
// (including the disabled/read-only state for non-admins) must use
// contrastText to stay legible against primary.main.
const CronField = styled(TextField)(({ theme }) => ({
  // Grow into available space but allow shrinking on a narrow card (the input
  // scrolls its text), so the copy/reset icons always stay on-screen.
  flex: '1 1 auto',
  minWidth: 0,
  maxWidth: 320,
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 8,
    // Pin the field to a fixed 40px height in every theme and viewport. The
    // input's natural height depends on box-sizing (MUI uses content-box; a
    // surrounding ScopedCssBaseline emits `* { box-sizing: inherit }` →
    // border-box), and which rule wins depends on emotion's injection order — so
    // without a fixed height, toggling dark mode flips the input (and header)
    // height. A fixed height on the container (which has no padding of its own)
    // is box-sizing-independent, so the field is exactly 40px everywhere.
    height: 40,
    boxSizing: 'border-box',
    '& input': {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      fontSize: 13,
      letterSpacing: '0.5px',
      color: theme.palette.primary.contrastText,
      // Horizontal inset only; the input is vertically centered within the
      // fixed-height container above.
      padding: '0 10px',
    },
    '& input.Mui-disabled': {
      color: theme.palette.primary.contrastText,
      WebkitTextFillColor: theme.palette.primary.contrastText,
    },
    '& fieldset': { border: 'none' },
  },
}));

// Cron field + copy/reset, kept together as one unit. The growing Title pushes
// this group to the right on a wide card; on a narrow card the whole group
// wraps to a second row (and the cron field shrinks) so copy/reset never split
// off or get clipped — and with no left margin the group sits at the header's
// left padding, aligning the cron field under the title's calendar icon.
const Actions = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  minWidth: 0,
});

const HeaderIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  opacity: 0.85,
  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.16)', opacity: 1 },
}));

interface SchedulerHeaderProps {
  sx?: SxProps<Theme>;
  /** Overrides the locale's title text next to the calendar icon. */
  title?: string;
}

const DEFAULT_CRON = '0 0 * * *';

export default function SchedulerHeader({ sx, title }: SchedulerHeaderProps) {
  const isAdmin = useAtomValue(isAdminState);
  const locale = useAtomValue(localeState);
  const [cronExp, setCronExp] = useAtom(cronExpState);
  const [cronExpInput, setCronExpInput] = useAtom(cronExpInputState);
  const [copied, setCopied] = React.useState(false);

  // Two-way text<->state binding, preserved verbatim from the previous
  // CronExp component (the #20 prop-sync fix lives in Scheduler.tsx; this is
  // the debounced text side). Do NOT collapse these into one effect.
  const debouncedCronExpInput = useDebounce(cronExpInput, 500);

  React.useEffect(() => {
    setCronExpInput(cronExp);
  }, [cronExp, setCronExpInput]);

  React.useEffect(() => {
    if (debouncedCronExpInput) {
      setCronExp(debouncedCronExpInput);
    }
  }, [debouncedCronExpInput, setCronExp]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(cronExpInput);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (e.g. non-secure context) — fail silently.
    }
  };

  return (
    <Bar sx={sx}>
      <Title variant='subtitle1'>
        <CalendarMonthIcon fontSize='small' />
        {title ?? localeString(locale, 'scheduleTitle')}
      </Title>
      <Actions>
        <CronField
          variant='outlined'
          size='small'
          value={cronExpInput}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setCronExpInput(event.target.value)
          }
          disabled={!isAdmin}
          slotProps={{ htmlInput: { 'aria-label': 'cron expression' } }}
        />
        <Tooltip
          title={copied ? localeString(locale, 'copiedText') : localeString(locale, 'copyLabel')}
          arrow
        >
          <HeaderIconButton
            onClick={handleCopy}
            aria-label={localeString(locale, 'copyLabel')}
            size='small'
          >
            <ContentCopyIcon fontSize='small' />
          </HeaderIconButton>
        </Tooltip>
        {/* Reset mutates the schedule, so it stays admin-gated (as before). */}
        <Tooltip title={localeString(locale, 'resetLabel')} arrow>
          <span>
            <HeaderIconButton
              onClick={() => setCronExpInput(DEFAULT_CRON)}
              disabled={!isAdmin}
              aria-label={localeString(locale, 'resetLabel')}
              size='small'
            >
              <RestartAltIcon fontSize='small' />
            </HeaderIconButton>
          </span>
        </Tooltip>
      </Actions>
    </Bar>
  );
}
