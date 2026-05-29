import { atom } from 'jotai';
import type { Setter } from 'jotai/vanilla';
import {
  atEveryOptions,
  defaultMinuteOptionsWithOrdinal,
  DEFAULT_DAY_OF_MONTH_OPTS,
  DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD,
  DEFAULT_HOUR_OPTS_EVERY,
  DEFAULT_MINUTE_OPTS,
  getLastDayOfMonthOption,
  getMonthOptions,
  getPeriodOptions,
  onEveryOptions,
  weekOptions,
} from './constants';
import {
  cronValidationErrorMessageState,
  dayOfMonthAtEveryState,
  dayOfMonthRangeEndSchedulerState,
  dayOfMonthRangeStartSchedulerState,
  dayOfMonthState,
  hourAtEveryState,
  hourRangeEndSchedulerState,
  hourRangeStartSchedulerState,
  hourState,
  localeState,
  minuteAtEveryState,
  minuteRangeEndSchedulerState,
  minuteRangeStartSchedulerState,
  minuteState,
  monthState,
  periodState,
  weekState,
} from './store';
import type { Locale } from './types';
import {
  getMinutesIndex,
  getPeriodIndex,
  getTimeIndex,
  getTimesOfTheDay,
  isIncreasingSequence,
  validateCronExp,
} from './utils';

export const minuteCronState = atom((get) => {
  const minutes = get(minuteState);
  if (
    minutes.map((minute) => minute.value).join('') ===
    DEFAULT_MINUTE_OPTS.map((minute) => minute.value).join('')
  ) {
    return '*';
  } else if (get(minuteAtEveryState).value === 'every') {
    const startIndex = getMinutesIndex(get(minuteRangeStartSchedulerState));
    const endIndex = getMinutesIndex(get(minuteRangeEndSchedulerState));
    if (endIndex - startIndex === 59) {
      return `*/${minutes.map((minute) => minute.value).join('')}`;
    }
    return `${startIndex}-${endIndex}/${minutes.map((minute) => minute.value).join('')}`;
  } else if (isIncreasingSequence(minutes) && minutes.length !== 1) {
    return `${minutes[0].value}-${minutes[minutes.length - 1].value}`;
  } else {
    return minutes.map((minute) => minute.value).join(',');
  }
});

export const hourCronState = atom((get) => {
  const hours = get(hourState);
  if (
    getPeriodIndex(get(periodState)) < 1 ||
    hours.map((hour) => hour.value).join('') ===
      DEFAULT_HOUR_OPTS_EVERY.map((hour) => hour.value).join('')
  ) {
    return '*';
  } else if (get(hourAtEveryState).value === 'every') {
    const startIndex = getTimeIndex(get(hourRangeStartSchedulerState));
    const endIndex = getTimeIndex(get(hourRangeEndSchedulerState));
    if (endIndex - startIndex === 23) {
      return `*/${hours.map((hour) => hour.value).join('')}`;
    }
    return `${startIndex}-${endIndex}/${hours.map((hour) => hour.value).join('')}`;
  } else if (isIncreasingSequence(hours) && hours.length !== 1) {
    return `${hours[0].value}-${hours[hours.length - 1].value}`;
  } else {
    return hours.map((hour) => hour.value).join(',');
  }
});

export const dayOfMonthCronState = atom((get) => {
  const dayOfMonth = get(dayOfMonthState);
  if (
    getPeriodIndex(get(periodState)) < 3 ||
    dayOfMonth.map((dayOfMonth) => dayOfMonth.value).join('') ===
      DEFAULT_DAY_OF_MONTH_OPTS.map((day) => day.value).join('')
  ) {
    return '*';
  } else if (get(dayOfMonthAtEveryState).value === 'every') {
    const startIndex = get(dayOfMonthRangeStartSchedulerState).value;
    const endIndex = get(dayOfMonthRangeEndSchedulerState).value;
    if (Number(endIndex) - Number(startIndex) === 30) {
      return `*/${dayOfMonth.map((dayOfMonth) => dayOfMonth.value).join('')}`;
    }
    return `${startIndex}-${endIndex}/${dayOfMonth.map((dayOfMonth) => dayOfMonth.value).join('')}`;
  } else if (dayOfMonth[0].value === 'L') {
    return 'L';
  } else if (isIncreasingSequence(dayOfMonth) && dayOfMonth.length !== 1) {
    return `${dayOfMonth[0].value}-${dayOfMonth[dayOfMonth.length - 1].value}`;
  } else {
    return dayOfMonth.map((dayOfMonth) => dayOfMonth.value).join(',');
  }
});

export const monthCronState = atom((get) => {
  const months = get(monthState);
  if (
    getPeriodIndex(get(periodState)) < 4 ||
    get(monthState)
      .map((month) => month.value)
      .join('') ===
      getMonthOptions(get(localeState).shortMonthOptions)
        .map((month) => month.value)
        .join('')
  ) {
    return '*';
  } else if (isIncreasingSequence(months) && months.length !== 1) {
    return `${months[0].value}-${months[months.length - 1].value}`;
  } else {
    return months.map((month) => month.value).join(',');
  }
});

export const dayOfWeekCronState = atom((get) => {
  const weeks = get(weekState);
  if (getPeriodIndex(get(periodState)) < 2) {
    return '*';
  } else if (
    get(weekState)
      .map((dayOfWeek) => dayOfWeek.value)
      .join('') ===
    weekOptions(get(localeState).weekDaysOptions)
      .map((week) => week.value)
      .join('')
  ) {
    return '*';
  } else if (isIncreasingSequence(weeks) && weeks.length !== 1) {
    return `${weeks[0].value}-${weeks[weeks.length - 1].value}`;
  } else if (weeks.length === 1) {
    return weeks[0].value;
  } else {
    return weeks.map((week) => week.value).join(',');
  }
});

export const cronExpState = atom(
  (get) =>
    `${get(minuteCronState)} ${get(hourCronState)} ${get(dayOfMonthCronState)} ${get(
      monthCronState,
    )} ${get(dayOfWeekCronState)}`,
  (get, set, newValue: string | unknown) => {
    const next = newValue?.toString() ?? '';
    const res = validateCronExp(next);
    set(cronValidationErrorMessageState, res.hasError ? res.message : '');
    if (!res.hasError) {
      // Snapshot the cron currently implied by the field/period atoms *before*
      // regenerating them. If the incoming value matches, this is a round-trip
      // from a manual field/period edit and we must not re-derive the period
      // (otherwise selecting a broad period on default fields would snap back).
      const currentDerived = get(cronExpState);
      const cronParts = next.split(' ');
      generateMinute(cronParts[0], get(localeState), set as Setter);
      generateHour(cronParts[1], get(localeState), set as Setter);
      generateDayOfMonth(cronParts[2], get(localeState), set as Setter);
      generateMonth(cronParts[3], get(localeState), set as Setter);
      generateWeek(cronParts[4], get(localeState), set as Setter);
      if (next !== currentDerived) {
        // External (prop/text) change: derive the period from the highest
        // non-`*` segment and set it unconditionally so going from a narrow cron
        // (e.g. `30 9 * * 1`) to a broad one (`* * * * *`) resets it instead of
        // staying stuck on the old, now-stale period.
        const periodOptions = getPeriodOptions(get(localeState).periodOptions);
        let periodIndex = 0;
        if (cronParts[3] !== '*') {
          periodIndex = 4;
        } else if (cronParts[2] !== '*') {
          periodIndex = 3;
        } else if (cronParts[4] !== '*') {
          periodIndex = 2;
        } else if (cronParts[1] !== '*') {
          periodIndex = 1;
        }
        set(periodState, periodOptions[periodIndex]);
      }
    }
  },
);

const generateMinute = (part: string, locale: Locale, set: Setter) => {
  if (part.indexOf('/') > 0) {
    const subparts = part.split('/');
    set(minuteAtEveryState, atEveryOptions(locale.atOptionLabel, locale.everyOptionLabel)[1]);
    if (subparts[0].indexOf('-') > 0) {
      const subsubparts = subparts[0].split('-');
      set(
        minuteRangeStartSchedulerState,
        defaultMinuteOptionsWithOrdinal()[Number(subsubparts[0])],
      );
      set(minuteRangeEndSchedulerState, defaultMinuteOptionsWithOrdinal()[Number(subsubparts[1])]);
    } else if (subparts[0] === '*') {
      set(minuteRangeStartSchedulerState, defaultMinuteOptionsWithOrdinal()[0]);
      set(minuteRangeEndSchedulerState, defaultMinuteOptionsWithOrdinal()[59]);
    } else {
      // Plain `n/m` (e.g. 1/4): start at n, end at the max.
      set(minuteRangeStartSchedulerState, defaultMinuteOptionsWithOrdinal()[Number(subparts[0])]);
      set(minuteRangeEndSchedulerState, defaultMinuteOptionsWithOrdinal()[59]);
    }
    set(minuteState, [DEFAULT_MINUTE_OPTS[Number(subparts[1])]]);
  } else if (part.indexOf('-') > 0) {
    const subparts = part.split('-');
    set(
      minuteState,
      DEFAULT_MINUTE_OPTS.filter((_, idx) => {
        return idx >= Number(subparts[0]) && idx <= Number(subparts[1]);
      }),
    );
  } else if (part !== '*') {
    set(minuteAtEveryState, atEveryOptions(locale.atOptionLabel, locale.everyOptionLabel)[0]);
    set(
      minuteState,
      DEFAULT_MINUTE_OPTS.filter((_, idx) => {
        return part.split(',').includes(idx.toString());
      }),
    );
  } else if (part === '*') {
    set(minuteAtEveryState, atEveryOptions(locale.atOptionLabel, locale.everyOptionLabel)[0]);
    set(minuteState, DEFAULT_MINUTE_OPTS);
  }
};

const generateHour = (part: string, locale: Locale, set: Setter) => {
  if (part.indexOf('/') > 0) {
    const subparts = part.split('/');
    set(hourAtEveryState, atEveryOptions(locale.atOptionLabel, locale.everyOptionLabel)[1]);
    if (subparts[0].indexOf('-') > 0) {
      const subsubparts = subparts[0].split('-');
      set(hourRangeStartSchedulerState, getTimesOfTheDay()[Number(subsubparts[0])]);
      set(hourRangeEndSchedulerState, getTimesOfTheDay()[Number(subsubparts[1])]);
    } else if (subparts[0] === '*') {
      set(hourRangeStartSchedulerState, getTimesOfTheDay()[0]);
      set(hourRangeEndSchedulerState, getTimesOfTheDay()[23]);
    } else {
      // Plain `n/m` (e.g. 1/4): start at n, end at the max.
      set(hourRangeStartSchedulerState, getTimesOfTheDay()[Number(subparts[0])]);
      set(hourRangeEndSchedulerState, getTimesOfTheDay()[23]);
    }
    set(hourState, [DEFAULT_HOUR_OPTS_EVERY[Number(subparts[1])]]);
  } else if (part.indexOf('-') > 0) {
    const subparts = part.split('-');
    set(
      hourState,
      DEFAULT_HOUR_OPTS_EVERY.filter((_, idx) => {
        return idx >= Number(subparts[0]) && idx <= Number(subparts[1]);
      }),
    );
  } else if (part !== '*') {
    set(hourAtEveryState, atEveryOptions(locale.atOptionLabel, locale.everyOptionLabel)[0]);
    set(
      hourState,
      DEFAULT_HOUR_OPTS_EVERY.filter((_, idx) => {
        return part.split(',').includes(idx.toString());
      }),
    );
  } else if (part === '*') {
    set(hourAtEveryState, atEveryOptions(locale.atOptionLabel, locale.everyOptionLabel)[0]);
    set(hourState, DEFAULT_HOUR_OPTS_EVERY);
  }
};

const generateDayOfMonth = (part: string, locale: Locale, set: Setter) => {
  if (part.indexOf('/') > 0) {
    const subparts = part.split('/');
    set(dayOfMonthAtEveryState, onEveryOptions(locale.onOptionLabel, locale.everyOptionLabel)[1]);
    if (subparts[0].indexOf('-') > 0) {
      const subsubparts = subparts[0].split('-');
      set(
        dayOfMonthRangeStartSchedulerState,
        DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD[Number(subsubparts[0]) - 1],
      );
      set(
        dayOfMonthRangeEndSchedulerState,
        DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD[Number(subsubparts[1]) - 1],
      );
    } else if (subparts[0] === '*') {
      set(dayOfMonthRangeStartSchedulerState, DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD[0]);
      set(dayOfMonthRangeEndSchedulerState, DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD[30]);
    } else {
      // Plain `n/m` (e.g. 1/4): start at n, end at the max.
      set(
        dayOfMonthRangeStartSchedulerState,
        DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD[Number(subparts[0]) - 1],
      );
      set(dayOfMonthRangeEndSchedulerState, DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD[30]);
    }
    set(dayOfMonthState, [DEFAULT_DAY_OF_MONTH_OPTS[Number(subparts[1]) - 1]]);
  } else if (part === 'L') {
    set(dayOfMonthAtEveryState, onEveryOptions(locale.onOptionLabel, locale.everyOptionLabel)[0]);
    set(dayOfMonthState, [getLastDayOfMonthOption(locale.lastDayOfMonthLabel)]);
  } else if (part.indexOf('-') > 0) {
    const subparts = part.split('-');
    set(
      dayOfMonthState,
      DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD.filter((_, idx) => {
        return idx + 1 >= Number(subparts[0]) && idx + 1 <= Number(subparts[1]);
      }),
    );
  } else if (part !== '*') {
    set(dayOfMonthAtEveryState, onEveryOptions(locale.onOptionLabel, locale.everyOptionLabel)[0]);
    set(
      dayOfMonthState,
      DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD.filter((_, idx) => {
        return part.split(',').includes((idx + 1).toString());
      }),
    );
  } else if (part === '*') {
    set(dayOfMonthAtEveryState, onEveryOptions(locale.onOptionLabel, locale.everyOptionLabel)[0]);
    set(dayOfMonthState, DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD);
  }
};

const generateMonth = (part: string, locale: Locale, set: Setter) => {
  if (part.indexOf('-') > 0) {
    const subparts = part.split('-');
    set(
      monthState,
      getMonthOptions(locale.shortMonthOptions).filter((_, idx) => {
        return idx + 1 >= Number(subparts[0]) && idx + 1 <= Number(subparts[1]);
      }),
    );
  } else if (part !== '*') {
    set(
      monthState,
      getMonthOptions(locale.shortMonthOptions).filter((_, idx) => {
        return part.split(',').includes((idx + 1).toString());
      }),
    );
  } else {
    set(monthState, getMonthOptions(locale.shortMonthOptions));
  }
};

const generateWeek = (part: string, locale: Locale, set: Setter) => {
  if (part.indexOf('-') > 0) {
    const subparts = part.split('-');
    set(
      weekState,
      weekOptions(locale.weekDaysOptions).filter((_, idx) => {
        return idx >= Number(subparts[0]) && idx <= Number(subparts[1]);
      }),
    );
  } else if (part !== '*') {
    set(
      weekState,
      weekOptions(locale.weekDaysOptions).filter((_, idx) => {
        return part.split(',').includes(idx.toString());
      }),
    );
  } else {
    set(weekState, weekOptions(locale.weekDaysOptions));
  }
};
