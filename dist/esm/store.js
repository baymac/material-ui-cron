import { atom, selector } from 'recoil';
import { atEveryOptions, defaultMinuteOptionsWithOrdinal, DEFAULT_DAY_OF_MONTH_OPTS, DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD, DEFAULT_HOUR_OPTS_EVERY, DEFAULT_MINUTE_OPTS, getMonthOptions, getPeriodOptions, onEveryOptions, weekOptions } from './constants';
import defaultLocale from './localization/enLocale';
import { getTimesOfTheDay } from './utils';
export const localeState = atom({
  key: 'localeState',
  default: defaultLocale
});
export const periodState = atom({
  key: 'periodState',
  default: selector({
    key: 'periodStateDefaultSelector',
    get: ({
      get
    }) => {
      const resolvedLocale = get(localeState);
      return getPeriodOptions(resolvedLocale.periodOptions)[1];
    }
  })
});
export const minuteState = atom({
  key: 'minuteState',
  default: [DEFAULT_MINUTE_OPTS[0]]
});
export const minuteAtEveryState = atom({
  key: 'minuteAtEveryState',
  default: selector({
    key: 'minuteAtEveryStateDefaultSelector',
    get: ({
      get
    }) => {
      const resolvedLocale = get(localeState);
      return atEveryOptions(resolvedLocale.atOptionLabel, resolvedLocale.everyOptionLabel)[0];
    }
  })
});
export const minuteRangeStartSchedulerState = atom({
  key: 'minuteRangeStartSchedulerState',
  default: defaultMinuteOptionsWithOrdinal()[0]
});
export const minuteRangeEndSchedulerState = atom({
  key: 'minuteRangeEndSchedulerState',
  default: defaultMinuteOptionsWithOrdinal()[59]
});
export const hourState = atom({
  key: 'hourState',
  default: [DEFAULT_HOUR_OPTS_EVERY[0]]
});
export const hourAtEveryState = atom({
  key: 'hourAtEveryState',
  default: selector({
    key: 'hourAtEveryStateDefaultSelector',
    get: ({
      get
    }) => {
      const resolvedLocale = get(localeState);
      return atEveryOptions(resolvedLocale.atOptionLabel, resolvedLocale.everyOptionLabel)[0];
    }
  })
});
export const hourRangeStartSchedulerState = atom({
  key: 'hourRangeStartSchedulerState',
  default: getTimesOfTheDay()[0]
});
export const hourRangeEndSchedulerState = atom({
  key: 'hourRangeEndSchedulerState',
  default: getTimesOfTheDay()[23]
});
export const dayOfMonthAtEveryState = atom({
  key: 'dayOfMonthAtEveryState',
  default: selector({
    key: 'dayOfMonthAtEveryStateDefaultSelector',
    get: ({
      get
    }) => {
      const resolvedLocale = get(localeState);
      console.log(resolvedLocale);
      return onEveryOptions(resolvedLocale.onOptionLabel, resolvedLocale.everyOptionLabel)[0];
    }
  })
});
export const dayOfMonthState = atom({
  key: 'dayOfMonthState',
  default: DEFAULT_DAY_OF_MONTH_OPTS
});
export const dayOfMonthRangeStartSchedulerState = atom({
  key: 'dayOfMonthRangeStartSchedulerState',
  default: DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD[0]
});
export const dayOfMonthRangeEndSchedulerState = atom({
  key: 'dayOfMonthRangeEndSchedulerState',
  default: DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD[30]
});
export const weekState = atom({
  key: 'weekState',
  default: selector({
    key: 'weekStateDefaultSelector',
    get: ({
      get
    }) => {
      const resolvedLocale = get(localeState);
      return weekOptions(resolvedLocale.weekDaysOptions);
    }
  })
});
export const monthState = atom({
  key: 'monthState',
  default: selector({
    key: 'monthStateDefaultSelector',
    get: ({
      get
    }) => {
      const resolvedLocale = get(localeState);
      return getMonthOptions(resolvedLocale.shortMonthOptions);
    }
  })
});
export const cronValidationErrorMessageState = atom({
  key: 'cronValidationErrorMessageState',
  default: ''
});
export const isAdminState = atom({
  key: 'isAdminState',
  default: true
});
export const cronExpInputState = atom({
  key: 'cronExpInputState',
  default: '0 0 * * *'
});