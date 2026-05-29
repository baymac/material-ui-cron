import type { AutocompleteRenderGetTagProps } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
// Replaced Recoil setter type with a generic setter signature

export type PeriodType = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute';

/** Layout posture for the Scheduler card. */
export type SchedulerLayout = 'auto' | 'split' | 'stacked';

/** Per-slot style overrides (e.g. force the indigo header look). */
export interface SchedulerSlotProps {
  header?: { sx?: SxProps<Theme> };
}

export interface CustomSelectProps {
  renderTags?: (
    value: SelectOptions[],
    getTagProps: AutocompleteRenderGetTagProps,
  ) => React.ReactNode;
  options: Array<SelectOptions>;
  value: SelectOptions | SelectOptions[];
  setValue: (value: any) => void;
  noOptionsText?: string;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  disableClearable?: boolean;
  forcePopupIcon?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  filterSelectedOptions?: boolean;
  className?: string;
  classes?: any;
  single?: boolean;
  sort?: boolean;
  disableEmpty?: boolean;
  limitTags?: number;
}

export interface SelectOptions {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CronAndHrTime {
  hrTime: string;
  cronTime: string;
}

export interface CronValidation {
  isValid: boolean;
  message: string;
}

export interface SchedulerProps {
  cron: string;
  setCron: React.Dispatch<React.SetStateAction<string>>;
  setCronError: React.Dispatch<React.SetStateAction<string>>;
  isAdmin?: boolean;
  locale?: definedLocales;
  customLocale?: Locale;
  /** IANA timezone for the Next-runs preview. Defaults to the local zone. */
  timezone?: string;
  /** Force the responsive posture. 'auto' (default) uses a container query. */
  layout?: SchedulerLayout;
  /**
   * Header title shown next to the calendar icon. Takes precedence over the
   * locale's `scheduleTitle`. Defaults to the locale value ("Schedule" in en).
   */
  title?: string;
  /**
   * Accent color for the card — the header bar, the selected segment of the
   * At/Every & On/Every toggles, and the single-value section pills. Overrides
   * the MUI theme's `palette.primary`; the contrast (text) color is recomputed
   * from it. Accepts any CSS color the theme accepts (hex, rgb, etc.). When
   * omitted the surrounding theme's primary color is used.
   */
  color?: string;
  /** Per-slot style overrides. */
  slotProps?: SchedulerSlotProps;
}

export interface Locale {
  atEveryText: string;
  betweenText: string;
  inText: string;
  onText: string;
  andText: string;
  onEveryText: string;
  everyText: string;
  atOptionLabel: string;
  everyOptionLabel: string;
  periodLabel: string;
  minuteLabel: string;
  monthLabel: string;
  multiDayOfMonthLabel: string;
  dayOfMonthLabel: string;
  hourLabel: string;
  dayOfWeekLabel: string;
  weekDaysOptions: string[];
  periodOptions: string[];
  shortMonthOptions: string[];
  onOptionLabel: string;
  lastDayOfMonthLabel: string;
  // --- Redesign PR1: header + Next-runs panel strings. OPTIONAL with English
  // fallback (see localization/strings.ts) so adding them is NOT a breaking
  // change for existing `customLocale` consumers. ---
  /** Header title next to the calendar icon. Default: "Schedule". */
  scheduleTitle?: string;
  /** Next-runs panel label. Default: "Next runs". */
  nextRunsLabel?: string;
  /** Shown when the cron is valid but produces no future runs. Default: "No upcoming runs". */
  noUpcomingRunsText?: string;
  /** Shown when the cron is invalid. Default: "Enter a valid schedule to preview runs". */
  invalidScheduleText?: string;
  /** Copy-button tooltip. Default: "Copy". */
  copyLabel?: string;
  /** Copy-success feedback. Default: "Copied!". */
  copiedText?: string;
  /** Reset-button tooltip. Default: "Reset". */
  resetLabel?: string;
  cronDescriptionText: // Can be among the list of locale available for construe library https://github.com/bradymholt/cronstrue#supported-locales, if more locales added to construe, add it here
    | 'en'
    | 'ca'
    | 'cs'
    | 'es'
    | 'da'
    | 'de'
    | 'fi'
    | 'fr'
    | 'fa'
    | 'he'
    | 'it'
    | 'ja'
    | 'ko'
    | 'nb'
    | 'nl'
    | 'pl'
    | 'pt_BR'
    | 'ro'
    | 'ru'
    | 'sk'
    | 'sl'
    | 'sw'
    | 'sv'
    | 'tr'
    | 'uk'
    | 'zh_CN'
    | 'zh_TW';
}

export type definedLocales = 'en' | 'zh_CN';

export type definedLocalesMap = Record<definedLocales, Locale>;
