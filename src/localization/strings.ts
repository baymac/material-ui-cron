import type { Locale } from '../types';

// English fallbacks for the OPTIONAL redesign strings. Keeping the keys
// optional on `Locale` avoids a breaking change for existing `customLocale`
// consumers; these defaults fill the gap when a consumer's locale omits them.
export const FALLBACK_STRINGS = {
  scheduleTitle: 'Schedule',
  nextRunsLabel: 'Next runs',
  noUpcomingRunsText: 'No upcoming runs',
  invalidScheduleText: 'Enter a valid schedule to preview runs',
  copyLabel: 'Copy',
  copiedText: 'Copied!',
  resetLabel: 'Reset',
  calendarLabel: 'Upcoming',
} as const;

type FallbackKey = keyof typeof FALLBACK_STRINGS;

/** Resolve an optional locale string, falling back to the English default. */
export function localeString(locale: Locale, key: FallbackKey): string {
  return locale[key] ?? FALLBACK_STRINGS[key];
}
