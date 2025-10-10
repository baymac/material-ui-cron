import { atom } from 'jotai';
import { atomWithDefault } from 'jotai/utils';
import {
  atEveryOptions,
  defaultMinuteOptionsWithOrdinal,
  DEFAULT_DAY_OF_MONTH_OPTS,
  DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD,
  DEFAULT_HOUR_OPTS_EVERY,
  DEFAULT_MINUTE_OPTS,
  getMonthOptions,
  getPeriodOptions,
  onEveryOptions,
  weekOptions,
} from './constants';
import defaultLocale from './localization/enLocale';
import type { Locale, SelectOptions } from './types';
import { getTimesOfTheDay } from './utils';

export const localeState = atom<Locale>(defaultLocale);

export const periodState = atomWithDefault<SelectOptions>((get) => {
  const resolvedLocale = get(localeState);
  return getPeriodOptions(resolvedLocale.periodOptions)[1];
});

export const minuteState = atom<SelectOptions[]>([DEFAULT_MINUTE_OPTS[0]]);

export const minuteAtEveryState = atomWithDefault<SelectOptions>((get) => {
  const resolvedLocale = get(localeState);
  return atEveryOptions(resolvedLocale.atOptionLabel, resolvedLocale.everyOptionLabel)[0];
});

export const minuteRangeStartSchedulerState = atom(defaultMinuteOptionsWithOrdinal()[0]);

export const minuteRangeEndSchedulerState = atom(defaultMinuteOptionsWithOrdinal()[59]);

export const hourState = atom<SelectOptions[]>([DEFAULT_HOUR_OPTS_EVERY[0]]);

export const hourAtEveryState = atomWithDefault<SelectOptions>((get) => {
  const resolvedLocale = get(localeState);
  return atEveryOptions(resolvedLocale.atOptionLabel, resolvedLocale.everyOptionLabel)[0];
});

export const hourRangeStartSchedulerState = atom(getTimesOfTheDay()[0]);

export const hourRangeEndSchedulerState = atom(getTimesOfTheDay()[23]);

export const dayOfMonthAtEveryState = atomWithDefault<SelectOptions>((get) => {
  const resolvedLocale = get(localeState);
  return onEveryOptions(resolvedLocale.onOptionLabel, resolvedLocale.everyOptionLabel)[0];
});

export const dayOfMonthState = atom<SelectOptions[]>(DEFAULT_DAY_OF_MONTH_OPTS);

export const dayOfMonthRangeStartSchedulerState = atom(DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD[0]);

export const dayOfMonthRangeEndSchedulerState = atom(DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD[30]);

export const weekState = atomWithDefault<SelectOptions[]>((get) => {
  const resolvedLocale = get(localeState);
  return weekOptions(resolvedLocale.weekDaysOptions);
});

export const monthState = atomWithDefault<SelectOptions[]>((get) => {
  const resolvedLocale = get(localeState);
  return getMonthOptions(resolvedLocale.shortMonthOptions);
});

export const cronValidationErrorMessageState = atom<string>('');

export const isAdminState = atom<boolean>(true);

export const cronExpInputState = atom<string>('0 0 * * *');
