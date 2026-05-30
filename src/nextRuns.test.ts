import { describe, expect, it } from 'vitest';
import {
  addDays,
  addMonths,
  bucketRunsByDay,
  computeNextRuns,
  computeRunDays,
  computeRunsOnDay,
  computeRunsUntil,
  dayKeyInTz,
  formatAbsolute,
  formatDayKey,
  formatRelative,
  formatTime,
  localeToBcp47,
  monthKeyInTz,
  startOfDayInTz,
} from './nextRuns';

// Fixed anchor so occurrence math is deterministic (Fri 2026-05-29 17:00 UTC).
const ANCHOR = new Date('2026-05-29T17:00:00Z');

describe('computeNextRuns', () => {
  it('returns the requested number of future occurrences', async () => {
    const runs = await computeNextRuns('*/2 * * * 1-5', 5, { timezone: 'UTC', anchor: ANCHOR });
    expect(runs).toHaveLength(5);
    expect(runs[0].toISOString()).toBe('2026-05-29T17:02:00.000Z');
    expect(runs[1].toISOString()).toBe('2026-05-29T17:04:00.000Z');
    // Strictly increasing.
    for (let i = 1; i < runs.length; i++) {
      expect(runs[i].getTime()).toBeGreaterThan(runs[i - 1].getTime());
    }
  });

  it('handles the L (last day of month) form', async () => {
    const runs = await computeNextRuns('0 0 L * *', 1, { timezone: 'UTC', anchor: ANCHOR });
    expect(runs).toHaveLength(1);
    // May has 31 days -> last day is the 31st.
    expect(runs[0].toISOString()).toBe('2026-05-31T00:00:00.000Z');
  });

  it('returns [] for an impossible-but-syntactically-valid cron (Feb 30)', async () => {
    expect(await computeNextRuns('0 0 30 2 *', 5, { timezone: 'UTC', anchor: ANCHOR })).toEqual([]);
  });

  it('returns [] for unparseable input instead of throwing', async () => {
    // cron-parser throws on these -> guard returns []. (In the component this
    // path is also gated upstream by validateCronExp.)
    expect(await computeNextRuns('not a cron', 5, { anchor: ANCHOR })).toEqual([]);
    expect(await computeNextRuns('60 * * * *', 5, { anchor: ANCHOR })).toEqual([]);
  });

  it('never throws even for odd input, always returns an array', async () => {
    expect(Array.isArray(await computeNextRuns('', 5, { anchor: ANCHOR }))).toBe(true);
  });

  it('applies the timezone (same wall-clock cron resolves to different instants)', async () => {
    const utc = await computeNextRuns('0 12 * * *', 1, { timezone: 'UTC', anchor: ANCHOR });
    const ny = await computeNextRuns('0 12 * * *', 1, {
      timezone: 'America/New_York',
      anchor: ANCHOR,
    });
    expect(utc[0].toISOString()).not.toBe(ny[0].toISOString());
  });

  // Contract test (Codex #6): every cron the library can EMIT must be
  // consumable by cron-parser or degrade cleanly to []. None may throw.
  it('never throws on representative library-emitted crons', async () => {
    const emitted = [
      '*/5 * * * *',
      '0 1/4 * * *',
      '0 0 1-15/2 * *',
      '30 9 * * 1',
      '0 0 L * *',
      '0,15,30 8-17 * * 1-5',
      '* * * * *',
      '0 0 1 1 *',
    ];
    for (const cron of emitted) {
      const runs = await computeNextRuns(cron, 3, { timezone: 'UTC', anchor: ANCHOR });
      expect(Array.isArray(runs)).toBe(true);
      // Either real dates or a clean empty list — never a throw.
      runs.forEach((d) => expect(d).toBeInstanceOf(Date));
    }
  });
});

describe('computeRunsUntil', () => {
  it('enumerates every run within the window (not a fixed count)', async () => {
    // Hourly, 24h window from the anchor.
    const end = new Date('2026-05-30T17:00:00Z');
    const runs = await computeRunsUntil('0 * * * *', end, { timezone: 'UTC', anchor: ANCHOR });
    // 18:00 on the 29th through 17:00 on the 30th, inclusive.
    expect(runs.length).toBeGreaterThanOrEqual(23);
    runs.forEach((d) => expect(d.getTime()).toBeLessThanOrEqual(end.getTime()));
    for (let i = 1; i < runs.length; i++) {
      expect(runs[i].getTime()).toBeGreaterThan(runs[i - 1].getTime());
    }
  });

  it('caps the list at maxRuns for a dense schedule', async () => {
    const end = new Date('2027-05-29T17:00:00Z'); // a year out
    const runs = await computeRunsUntil('* * * * *', end, { timezone: 'UTC', anchor: ANCHOR }, 10);
    expect(runs).toHaveLength(10);
  });

  it('returns [] when the window contains no runs', async () => {
    // Monthly on the 1st -> nothing in a 30-minute window.
    const end = new Date('2026-05-29T17:30:00Z');
    expect(await computeRunsUntil('0 0 1 * *', end, { timezone: 'UTC', anchor: ANCHOR })).toEqual(
      [],
    );
  });

  it('returns [] for an impossible-but-valid cron (Feb 30)', async () => {
    const end = new Date('2027-01-01T00:00:00Z');
    expect(await computeRunsUntil('0 0 30 2 *', end, { timezone: 'UTC', anchor: ANCHOR })).toEqual(
      [],
    );
  });
});

describe('computeRunDays', () => {
  // The window the calendar enumerates: ~3 months out from the anchor.
  const HORIZON = new Date('2026-08-02T00:00:00Z');

  it('marks EVERY firing day of a dense cron across the whole window', async () => {
    // The regression: an every-minute cron used to stop being enumerated after
    // ~1000 runs (~16h), leaving June/July unmarked. Day-probing covers it all.
    const days = await computeRunDays('* * * * *', HORIZON, { timezone: 'UTC', anchor: ANCHOR });
    // Anchor is May 29; the window runs through Aug 1 inclusive — every day fires.
    expect(days[0]).toBe('2026-05-29');
    expect(days).toContain('2026-06-01');
    expect(days).toContain('2026-06-30');
    expect(days).toContain('2026-07-15');
    expect(days).toContain('2026-08-01');
    // ~65 consecutive days, strictly ascending and unique.
    expect(days.length).toBeGreaterThan(60);
    expect(new Set(days).size).toBe(days.length);
    for (let i = 1; i < days.length; i++) {
      expect(days[i] > days[i - 1]).toBe(true);
    }
  });

  it('marks only the firing days of a sparse cron', async () => {
    // Monthly on the 1st -> just the three 1st-of-month days in the window.
    const days = await computeRunDays('0 0 1 * *', HORIZON, { timezone: 'UTC', anchor: ANCHOR });
    expect(days).toEqual(['2026-06-01', '2026-07-01', '2026-08-01']);
  });

  it('keys firing days in the given timezone (a late-UTC run rolls back a day)', async () => {
    // Daily at 02:00 UTC is the previous day at 22:00 in New York (EDT).
    const utc = await computeRunDays('0 2 * * *', HORIZON, { timezone: 'UTC', anchor: ANCHOR });
    const ny = await computeRunDays('0 2 * * *', HORIZON, {
      timezone: 'America/New_York',
      anchor: ANCHOR,
    });
    expect(utc).toContain('2026-06-01');
    // Same instants land on May 31 .. July 31 in New York.
    expect(ny).toContain('2026-05-31');
  });

  it('returns [] when nothing fires in the window', async () => {
    // Feb 30 never happens.
    expect(await computeRunDays('0 0 30 2 *', HORIZON, { timezone: 'UTC', anchor: ANCHOR })).toEqual(
      [],
    );
  });
});

describe('computeRunsOnDay', () => {
  it('returns every run on the day (full 1440 for an every-minute cron)', async () => {
    const runs = await computeRunsOnDay('* * * * *', '2026-06-15', { timezone: 'UTC' });
    expect(runs).toHaveLength(1440);
    expect(runs[0].toISOString()).toBe('2026-06-15T00:00:00.000Z');
    expect(runs[1439].toISOString()).toBe('2026-06-15T23:59:00.000Z');
    runs.forEach((d) => expect(dayKeyInTz(d, 'UTC')).toBe('2026-06-15'));
  });

  it('includes a run sitting exactly on local midnight', async () => {
    // Daily at midnight: the 00:00 run must not be lost to the exclusive anchor.
    const runs = await computeRunsOnDay('0 0 * * *', '2026-06-15', { timezone: 'UTC' });
    expect(runs).toHaveLength(1);
    expect(runs[0].toISOString()).toBe('2026-06-15T00:00:00.000Z');
  });

  it('returns [] for a day with no runs', async () => {
    expect(await computeRunsOnDay('0 0 1 * *', '2026-06-15', { timezone: 'UTC' })).toEqual([]);
  });

  it('scopes runs to the day in the given timezone', async () => {
    const runs = await computeRunsOnDay('0 12 * * *', '2026-06-15', { timezone: 'America/New_York' });
    expect(runs).toHaveLength(1);
    // Noon in New York (EDT) is 16:00 UTC.
    expect(runs[0].toISOString()).toBe('2026-06-15T16:00:00.000Z');
  });
});

describe('addDays', () => {
  it('adds days, rolling month and year boundaries', () => {
    expect(addDays('2026-06-15', 1)).toBe('2026-06-16');
    expect(addDays('2026-06-30', 1)).toBe('2026-07-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
});

describe('startOfDayInTz', () => {
  it('returns the instant of local midnight for the key', () => {
    expect(startOfDayInTz('2026-06-15', 'UTC').toISOString()).toBe('2026-06-15T00:00:00.000Z');
    // New York is UTC-4 in June (EDT): local midnight is 04:00 UTC.
    expect(startOfDayInTz('2026-06-15', 'America/New_York').toISOString()).toBe(
      '2026-06-15T04:00:00.000Z',
    );
    // Kolkata is UTC+5:30: local midnight is 18:30 the previous UTC day.
    expect(startOfDayInTz('2026-06-15', 'Asia/Kolkata').toISOString()).toBe(
      '2026-06-14T18:30:00.000Z',
    );
  });

  it('round-trips through dayKeyInTz, even on DST transition days', () => {
    for (const [key, tz] of [
      ['2026-06-15', 'UTC'],
      ['2026-06-15', 'America/New_York'],
      ['2026-03-08', 'America/New_York'], // spring forward
      ['2026-11-01', 'America/New_York'], // fall back
    ] as const) {
      expect(dayKeyInTz(startOfDayInTz(key, tz), tz)).toBe(key);
    }
  });
});

describe('monthKeyInTz', () => {
  it('returns YYYY-MM in the given timezone', () => {
    expect(monthKeyInTz(new Date('2026-05-29T17:00:00Z'), 'UTC')).toBe('2026-05');
    // 02:00 UTC on June 1 is still May 31 in New York.
    expect(monthKeyInTz(new Date('2026-06-01T02:00:00Z'), 'America/New_York')).toBe('2026-05');
  });
});

describe('addMonths', () => {
  it('adds whole months, rolling the year over', () => {
    expect(addMonths('2026-05', 0)).toBe('2026-05');
    expect(addMonths('2026-05', 2)).toBe('2026-07');
    expect(addMonths('2026-11', 3)).toBe('2027-02');
  });
});

describe('dayKeyInTz', () => {
  it('keys the calendar day in the given timezone', () => {
    expect(dayKeyInTz(new Date('2026-05-30T02:00:00Z'), 'UTC')).toBe('2026-05-30');
    // 02:00 UTC on the 30th is 22:00 on the 29th in New York.
    expect(dayKeyInTz(new Date('2026-05-30T02:00:00Z'), 'America/New_York')).toBe('2026-05-29');
  });
});

describe('formatDayKey', () => {
  it('formats a YYYY-MM-DD key as a short weekday/month/day heading', () => {
    const out = formatDayKey('2026-05-29', 'en');
    expect(out).toContain('May');
    expect(out).toContain('29');
    // 2026-05-29 is a Friday.
    expect(out).toMatch(/Fri/);
  });
});

describe('bucketRunsByDay', () => {
  it('groups occurrences by their calendar day, keyed YYYY-MM-DD', () => {
    const runs = [
      new Date('2026-05-29T17:00:00Z'),
      new Date('2026-05-29T18:00:00Z'),
      new Date('2026-05-30T09:00:00Z'),
    ];
    const buckets = bucketRunsByDay(runs, 'UTC');
    expect([...buckets.keys()]).toEqual(['2026-05-29', '2026-05-30']);
    expect(buckets.get('2026-05-29')).toHaveLength(2);
    expect(buckets.get('2026-05-30')).toHaveLength(1);
  });

  it('buckets in the given timezone (a late-UTC run lands on the previous local day)', () => {
    // 02:00 UTC on the 30th is 22:00 on the 29th in New York (EDT, UTC-4).
    const run = [new Date('2026-05-30T02:00:00Z')];
    expect([...bucketRunsByDay(run, 'UTC').keys()]).toEqual(['2026-05-30']);
    expect([...bucketRunsByDay(run, 'America/New_York').keys()]).toEqual(['2026-05-29']);
  });

  it('returns an empty map for no runs', () => {
    expect(bucketRunsByDay([], 'UTC').size).toBe(0);
  });
});

describe('formatTime', () => {
  it('formats time-only, locale + timezone aware', () => {
    expect(formatTime(new Date('2026-05-29T18:00:00Z'), 'en', 'UTC')).toMatch(/6:00/);
    // 18:00 UTC is 2:00 PM in New York (EDT).
    expect(formatTime(new Date('2026-05-29T18:00:00Z'), 'en', 'America/New_York')).toMatch(/2:00/);
  });
});

describe('localeToBcp47', () => {
  it('maps library locale codes to BCP-47 tags', () => {
    expect(localeToBcp47('en')).toBe('en');
    expect(localeToBcp47('zh_CN')).toBe('zh-CN');
    expect(localeToBcp47('pt_BR')).toBe('pt-BR');
  });
});

describe('formatAbsolute', () => {
  it('formats locale + timezone aware without a date library', () => {
    const out = formatAbsolute(new Date('2026-05-29T18:00:00Z'), 'en', 'UTC');
    expect(out).toContain('May');
    expect(out).toContain('29');
    // 18:00 UTC -> 6:00 PM
    expect(out).toMatch(/6:00/);
  });

  it('respects a non-UTC timezone', () => {
    const out = formatAbsolute(new Date('2026-05-29T18:00:00Z'), 'en', 'America/New_York');
    // 18:00 UTC is 2:00 PM in New York (EDT).
    expect(out).toMatch(/2:00/);
  });
});

describe('formatRelative', () => {
  it('picks minutes / hours / days and never goes negative', () => {
    const now = ANCHOR;
    expect(formatRelative(new Date('2026-05-29T17:05:00Z'), now, 'en')).toMatch(/min/);
    expect(formatRelative(new Date('2026-05-29T19:00:00Z'), now, 'en')).toMatch(/h(ou)?r/);
    expect(formatRelative(new Date('2026-06-01T17:00:00Z'), now, 'en')).toMatch(/day/);
    // A run already in the past clamps to "now", never "-1".
    expect(formatRelative(new Date('2026-05-29T16:00:00Z'), now, 'en')).not.toContain('-');
  });
});
