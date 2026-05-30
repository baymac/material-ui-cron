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
 * Map the library's `cronDescriptionText` locale code (e.g. `en`, `zh_CN`,
 * `pt_BR`) to a BCP-47 tag the `Intl` APIs accept (`en`, `zh-CN`, `pt-BR`).
 */
export function localeToBcp47(localeCode: string): string {
  return localeCode.replace('_', '-');
}

/** "Fri, May 29, 6:00 PM" — locale + timezone aware, no date library. */
export function formatAbsolute(date: Date, localeTag: string, timezone?: string): string {
  return new Intl.DateTimeFormat(localeTag, {
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
  const rtf = new Intl.RelativeTimeFormat(localeTag, { numeric: 'always', style: 'short' });
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
