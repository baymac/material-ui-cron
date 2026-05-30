import { describe, expect, it } from 'vitest';
import {
  bucketRunsByDay,
  computeNextRuns,
  formatAbsolute,
  formatRelative,
  formatTime,
  localeToBcp47,
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
