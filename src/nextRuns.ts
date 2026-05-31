// `cron-parser` (and its transitive `luxon`) is the heaviest dependency in the
// bundle, yet it is only needed to compute the preview occurrences. It is
// imported *dynamically* inside computeNextRuns so the bundler splits it into a
// separate async chunk instead of inlining it into the main entry — the field
// editor renders without waiting on it. Hence computeNextRuns is async.

// Next-runs preview logic. Kept as PURE functions (no React, no wall-clock
// reads except the explicit `anchor`) so they unit-test in the Node project
// with a fixed clock. The component (NextRuns.tsx) owns the ticking `now`.
//
//   cronExpState (string) ──► computeNextRuns(cron, n, {timezone, anchor})
//                                   │  guarded by the library's own validator
//                                   ▼
//                              Date[]  ──► formatAbsolute / formatRelative

export interface NextRunsOptions {
  /** IANA timezone (e.g. "America/New_York"). Defaults to the local zone. */
  timezone?: string;
  /** Reference "now" the occurrences are computed forward from. */
  anchor?: Date;
}

// Intl constructors allocate a non-trivial amount of work per call; some of
// these formatters are built inside per-run loops (e.g. dayKeyInTz in
// bucketRunsByDay). Cache by locale + options so an identical formatter is
// reused across calls instead of reconstructed each time. The key set is small
// and bounded (a handful of option shapes × the active locale/timezone).
const dateTimeFormatCache = new Map<string, Intl.DateTimeFormat>();
function dateTimeFormat(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  let fmt = dateTimeFormatCache.get(key);
  if (!fmt) {
    // This IS the hoist the rule wants: the formatter is constructed once per
    // unique locale+options key and cached, not rebuilt per call.
    // react-doctor-disable-next-line react-doctor/js-hoist-intl
    fmt = new Intl.DateTimeFormat(locale, options);
    dateTimeFormatCache.set(key, fmt);
  }
  return fmt;
}

const relativeTimeFormatCache = new Map<string, Intl.RelativeTimeFormat>();
function relativeTimeFormat(
  locale: string,
  options: Intl.RelativeTimeFormatOptions,
): Intl.RelativeTimeFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  let fmt = relativeTimeFormatCache.get(key);
  if (!fmt) {
    // Cached the same way as dateTimeFormat above — built once per key.
    // react-doctor-disable-next-line react-doctor/js-hoist-intl
    fmt = new Intl.RelativeTimeFormat(locale, options);
    relativeTimeFormatCache.set(key, fmt);
  }
  return fmt;
}

/**
 * Compute the next `count` occurrences of a cron expression.
 *
 * The caller is expected to gate this behind the library's own
 * `validateCronExp` (single source of truth for validity). Even so, this is
 * wrapped in try/catch because `cron-parser` has its own grammar and throws on
 * impossible-but-syntactically-valid expressions (e.g. `0 0 30 2 *`). On any
 * failure it returns `[]` so the UI degrades to a "no upcoming runs" message
 * instead of crashing.
 */
export async function computeNextRuns(
  cron: string,
  count = 5,
  opts: NextRunsOptions = {},
): Promise<Date[]> {
  try {
    const { CronExpressionParser } = await import('cron-parser');
    const interval = CronExpressionParser.parse(cron, {
      currentDate: opts.anchor ?? new Date(),
      tz: opts.timezone,
    });
    const out: Date[] = [];
    for (let i = 0; i < count; i++) {
      out.push(interval.next().toDate());
    }
    return out;
  } catch {
    return [];
  }
}

/**
 * Compute *every* occurrence of `cron` from now (or `anchor`) up to `endDate`.
 *
 * Unlike computeNextRuns (a fixed `count`), this enumerates the whole set inside
 * a window — the calendar needs ALL runs in the visible range so every day that
 * fires is marked, not just the first handful. Capped at `maxRuns` so a
 * once-a-minute cron can't produce an unbounded list (days past the cap simply
 * go unmarked). Same contract as computeNextRuns: callers gate it behind the
 * library's validator, it is wrapped in try/catch, and it returns `[]` on any
 * parser failure so the UI degrades to "no upcoming runs".
 */
export async function computeRunsUntil(
  cron: string,
  endDate: Date,
  opts: NextRunsOptions = {},
  maxRuns = 1000,
): Promise<Date[]> {
  try {
    const { CronExpressionParser } = await import('cron-parser');
    const interval = CronExpressionParser.parse(cron, {
      currentDate: opts.anchor ?? new Date(),
      endDate,
      tz: opts.timezone,
    });
    const out: Date[] = [];
    // `hasNext()` honours `endDate`, so the loop stops at the window edge; the
    // `maxRuns` guard is the backstop for dense schedules.
    while (out.length < maxRuns && interval.hasNext()) {
      out.push(interval.next().toDate());
    }
    return out;
  } catch {
    return [];
  }
}

/**
 * The set of calendar days (ISO `YYYY-MM-DD`, in `timezone`) that have at least
 * one run between now (or `anchor`) and `endDate`, returned in chronological
 * order.
 *
 * This is what the calendar needs to MARK firing days — and it must not depend
 * on schedule density. Enumerating every occurrence (computeRunsUntil) is fine
 * for a single day, but across a multi-month window a once-a-minute cron is
 * ~130k occurrences (≈1s of blocking) — and capping that list silently drops
 * whole months off the far end of the calendar. Instead we probe day-by-day:
 * find the next run, record its day, then SKIP the cursor to the start of the
 * following local day so the next probe lands on a fresh day. That is one parse
 * per *firing* day (≤ the window's days) regardless of how often the cron fires
 * within a day. Same degrade-to-empty contract as computeRunsUntil.
 */
export async function computeRunDays(
  cron: string,
  endDate: Date,
  opts: NextRunsOptions = {},
  maxDays = 400,
): Promise<string[]> {
  try {
    const { CronExpressionParser } = await import('cron-parser');
    const days: string[] = [];
    let cursor = opts.anchor ?? new Date();
    // Hard iteration backstop: each step normally advances a full day, but a
    // pathological tiny advance must never spin.
    let guard = 0;
    while (
      days.length < maxDays &&
      cursor.getTime() <= endDate.getTime() &&
      guard++ < maxDays * 2
    ) {
      const interval = CronExpressionParser.parse(cron, {
        currentDate: cursor,
        endDate,
        tz: opts.timezone,
      });
      if (!interval.hasNext()) break;
      const run = interval.next().toDate();
      const key = dayKeyInTz(run, opts.timezone);
      // Ascending probe order means a new day is always distinct from the last.
      if (days[days.length - 1] !== key) {
        days.push(key);
      }
      // Jump to the END of this run's local day (start of the next day, minus a
      // tick so a run sitting exactly on local midnight is still found). `max`
      // with run+1 guarantees forward progress even if a DST-edge boundary
      // resolves at or before the run.
      const nextDayStart = startOfDayInTz(addDays(key, 1), opts.timezone).getTime();
      cursor = new Date(Math.max(nextDayStart - 1, run.getTime() + 1));
    }
    return days;
  } catch {
    return [];
  }
}

/**
 * Every run on a single calendar `dayKey` (ISO `YYYY-MM-DD`, in `timezone`).
 * The selected-day list in the calendar needs the actual times for ONE day, so
 * this bounds the parser to that day's [midnight, next-midnight) window — at
 * most ~1440 runs for an every-minute cron, cheap to enumerate. The window
 * starts a tick before midnight because the parser's `currentDate` is exclusive
 * (a run at exactly 00:00 would otherwise be skipped); a stray next-day-midnight
 * run let in by the inclusive `endDate` is filtered back out by its day key.
 *
 * When `opts.anchor` ("now") falls past midnight on this day — i.e. the selected
 * day IS today — the window starts at the anchor instead, so runs that have
 * already elapsed today are not listed in a forward-looking "next runs" panel.
 * This keeps the per-day list consistent with computeRunDays, which already
 * anchors day-marking at now. For future days the anchor is earlier than
 * midnight and has no effect (the whole day is enumerated).
 */
export async function computeRunsOnDay(
  cron: string,
  dayKey: string,
  opts: NextRunsOptions = {},
): Promise<Date[]> {
  const start = startOfDayInTz(dayKey, opts.timezone);
  const end = startOfDayInTz(addDays(dayKey, 1), opts.timezone);
  const dayStart = start.getTime() - 1;
  // Later of [tick-before-midnight, now]: drops today's elapsed runs while
  // leaving full future days untouched.
  const anchorMs = opts.anchor ? Math.max(dayStart, opts.anchor.getTime()) : dayStart;
  const anchor = new Date(anchorMs);
  // 1500 > the 1440 minutes in a day, so an every-minute day is never clipped.
  const runs = await computeRunsUntil(cron, end, { timezone: opts.timezone, anchor }, 1500);
  return runs.filter((run) => dayKeyInTz(run, opts.timezone) === dayKey);
}

/**
 * Clamp a single day's run list to its first `head` and last `tail` runs so a
 * dense day (e.g. an every-minute cron's 1440 runs) renders a bounded preview
 * instead of an endless scroll. When the day has at most `head + tail` runs they
 * all fit and `tail`/`hidden` come back empty; otherwise the middle is collapsed
 * and `hidden` reports how many runs were dropped (for a "{count} more" divider).
 * Pure list math — the caller already scoped `runs` to one day and dropped any
 * elapsed ones.
 */
export function clampDayRuns(
  runs: Date[],
  head = 10,
  tail = 10,
): { head: Date[]; tail: Date[]; hidden: number } {
  if (runs.length <= head + tail) {
    return { head: runs, tail: [], hidden: 0 };
  }
  return {
    head: runs.slice(0, head),
    tail: runs.slice(runs.length - tail),
    hidden: runs.length - head - tail,
  };
}

/**
 * The `YYYY-MM` calendar month a `Date` falls in, evaluated in `timezone` (so a
 * late-UTC instant lands in the right local month). Pairs with bucketRunsByDay,
 * which keys days in the same zone.
 */
export function monthKeyInTz(date: Date, timezone?: string): string {
  const fmt = dateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    timeZone: timezone,
  });
  // en-CA yields "YYYY-MM"; normalise just in case a runtime emits "YYYY/MM".
  return fmt.format(date).replace('/', '-');
}

/**
 * Add `count` whole months to a `YYYY-MM` key, returning a new `YYYY-MM` key.
 * Pure string/number math (no Date) so it never drifts across DST or month
 * lengths — used to build the fixed current→+2 month window for the calendar.
 */
export function addMonths(ym: string, count: number): string {
  const [year, month] = ym.split('-').map(Number);
  const zeroBased = month - 1 + count;
  const y = year + Math.floor(zeroBased / 12);
  const m = ((zeroBased % 12) + 12) % 12;
  return `${y}-${String(m + 1).padStart(2, '0')}`;
}

/**
 * The `YYYY-MM-DD` calendar day a `Date` falls in, evaluated in `timezone`.
 * `en-CA` is a stable way to get a zero-padded ISO day out of `Intl`; the key is
 * a plain string so it matches a day cell rendered from the same `year-month-day`
 * parts without re-crossing a Date (no timezone drift). Shared by
 * bucketRunsByDay and the calendar's day-cell lookups so both key identically.
 */
export function dayKeyInTz(date: Date, timezone?: string): string {
  return dateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: timezone,
  }).format(date);
}

/**
 * Add `count` whole days to a `YYYY-MM-DD` key, returning a new `YYYY-MM-DD`
 * key. Day-of-month math is done in UTC so it rolls month/year boundaries
 * cleanly without ever applying a timezone offset to the calendar date itself.
 */
export function addDays(dayKey: string, count: number): string {
  const [year, month, day] = dayKey.split('-').map(Number);
  const dt = new Date(Date.UTC(year, month - 1, day + count));
  return dateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(dt);
}

/**
 * The zone's offset from UTC (ms) at a given instant: the instant's wall-clock
 * *as seen in `timezone`*, reinterpreted as if it were UTC, minus the real
 * instant. Used to invert dayKeyInTz (turn a calendar day back into an instant).
 */
function tzOffsetMs(date: Date, timezone?: string): number {
  const parts = dateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  // Some engines render midnight as hour "24"; normalise it to 0.
  const hour = get('hour') % 24;
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    hour,
    get('minute'),
    get('second'),
  );
  return asUtc - date.getTime();
}

/**
 * The instant of local midnight (00:00) for a `YYYY-MM-DD` key in `timezone` —
 * the inverse of dayKeyInTz. Two passes settle DST transition days where the
 * offset differs on either side of the boundary. With no timezone it resolves in
 * the runtime's local zone, matching how dayKeyInTz keys days. Used to bound a
 * single calendar day and to skip a dense schedule forward one day at a time.
 */
export function startOfDayInTz(dayKey: string, timezone?: string): Date {
  const [year, month, day] = dayKey.split('-').map(Number);
  const utcMidnight = Date.UTC(year, month - 1, day, 0, 0, 0);
  let offset = tzOffsetMs(new Date(utcMidnight), timezone);
  let instant = utcMidnight - offset;
  offset = tzOffsetMs(new Date(instant), timezone);
  instant = utcMidnight - offset;
  return new Date(instant);
}

/**
 * "Fri, May 29" — date-only heading for the selected calendar day, derived from
 * its `YYYY-MM-DD` key (works even for a day with no runs, where there is no
 * Date to format). The key already encodes the local calendar day, so its parts
 * are formatted in UTC to avoid re-applying a timezone offset.
 */
export function formatDayKey(dayKey: string, localeTag: string): string {
  const [year, month, day] = dayKey.split('-').map(Number);
  return dateTimeFormat(localeTag, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

/**
 * Map the library's `cronDescriptionText` locale code (e.g. `en`, `zh_CN`,
 * `pt_BR`) to a BCP-47 tag the `Intl` APIs accept (`en`, `zh-CN`, `pt-BR`).
 */
export function localeToBcp47(localeCode: string): string {
  return localeCode.replace('_', '-');
}

/**
 * Group occurrences by their calendar day in the given timezone, keyed by an
 * ISO `YYYY-MM-DD` string. Used by the calendar view to mark which days have
 * runs. `en-CA` is a stable way to get a zero-padded `YYYY-MM-DD` out of
 * `Intl`; the key is a plain string so it matches a day cell rendered from the
 * same `year-month-day` parts without re-crossing a Date (no timezone drift).
 */
export function bucketRunsByDay(runs: Date[], timezone?: string): Map<string, Date[]> {
  const buckets = new Map<string, Date[]>();
  for (const run of runs) {
    const key = dayKeyInTz(run, timezone);
    const existing = buckets.get(key);
    if (existing) {
      existing.push(run);
    } else {
      buckets.set(key, [run]);
    }
  }
  return buckets;
}

/** "6:00 PM" — time-only, locale + timezone aware (calendar day tooltips). */
export function formatTime(date: Date, localeTag: string, timezone?: string): string {
  return dateTimeFormat(localeTag, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  }).format(date);
}

/** "Fri, May 29, 6:00 PM" — locale + timezone aware, no date library. */
export function formatAbsolute(date: Date, localeTag: string, timezone?: string): string {
  return dateTimeFormat(localeTag, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  }).format(date);
}

/**
 * "in 5 min" / "in 2 hr" / "in 3 days" — locale aware via Intl.
 * Picks the largest sensible unit. Past/now clamps to the smallest positive
 * unit so a slightly-stale list never shows a negative ("in -1 min").
 */
export function formatRelative(date: Date, now: Date, localeTag: string): string {
  const rtf = relativeTimeFormat(localeTag, { numeric: 'always', style: 'short' });
  const diffMs = date.getTime() - now.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin <= 0) {
    return rtf.format(0, 'minute');
  }
  if (diffMin < 60) {
    return rtf.format(diffMin, 'minute');
  }
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) {
    return rtf.format(diffHr, 'hour');
  }
  const diffDays = Math.round(diffHr / 24);
  return rtf.format(diffDays, 'day');
}
