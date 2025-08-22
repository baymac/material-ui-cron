function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { getTimesOfTheDayList, range } from './utils';
export const generateOrdinalOptions = (start, end) => {
  return range(start, end).map(day => {
    let customLabel = `${day}th`;

    if (!(day.length > 1 && day.startsWith('1'))) {
      if (day.endsWith('1')) {
        customLabel = `${day}st`;
      } else if (day.endsWith('2')) {
        customLabel = `${day}nd`;
      } else if (day.endsWith('3')) {
        customLabel = `${day}rd`;
      }
    } else if (day === '0') {
      customLabel = '0';
    }

    return {
      value: day,
      label: customLabel
    };
  });
};
export const getPeriodOptions = periodOptionLabels => [{
  label: periodOptionLabels[0],
  value: 'hour'
}, {
  label: periodOptionLabels[1],
  value: 'day'
}, {
  label: periodOptionLabels[2],
  value: 'week'
}, {
  label: periodOptionLabels[3],
  value: 'month'
}, {
  label: periodOptionLabels[4],
  value: 'year'
}];
export const getPeriodOptionsWithHourDisabled = periodOptionLabels => getPeriodOptions(periodOptionLabels).map(periodOption => periodOption.value === 'hour' ? _objectSpread(_objectSpread({}, periodOption), {}, {
  disabled: true
}) : periodOption);
export const weekOptions = weekDayLabels => weekDayLabels.map((day, idx) => ({
  value: `${idx}`,
  label: day
}));
export const defaultDayOfMonthOptions = () => {
  return range(1, 31).map(day => {
    return {
      value: `${day}`,
      label: `${day}`
    };
  });
};
export const defaultDayOfMonthOptionsWithOrdinal = () => {
  return generateOrdinalOptions(1, 31);
};
export const getLastDayOfMonthOption = lastDayOfMonthLabel => ({
  value: 'L',
  label: lastDayOfMonthLabel
});
export const getDayOfMonthsOptionsWithL = lastDayOfMonthLabel => defaultDayOfMonthOptionsWithOrdinal().concat(getLastDayOfMonthOption(lastDayOfMonthLabel));
export const DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD = defaultDayOfMonthOptionsWithOrdinal();
export const DEFAULT_DAY_OF_MONTH_OPTS = defaultDayOfMonthOptions();
export const getMonthOptions = monthOptionLabels => monthOptionLabels.map((month, idx) => ({
  value: `${idx + 1}`,
  label: month
}));
export const defaultHourOptionsHr = () => {
  return getTimesOfTheDayList().map((time, idx) => {
    return {
      value: `${idx}`,
      label: time
    };
  });
};
export const defaultHourOptions = type => {
  return range(0, 23).map(time => {
    return _objectSpread({
      value: `${time}`,
      label: `${time}`
    }, time === '0' && type === 'every' && {
      disabled: true
    });
  });
};
export const DEFAULT_HOUR_OPTS_AT = defaultHourOptions();
export const DEFAULT_HOUR_OPTS_EVERY = defaultHourOptions('every');
export const defaultMinuteOptions = () => {
  return range(0, 59).map(time => {
    return {
      value: `${time}`,
      label: `${time}`
    };
  });
};
export const defaultMinuteOptionsWithOrdinal = () => DEFAULT_MINUTE_OPTS;
export const DEFAULT_MINUTE_OPTS = defaultMinuteOptions();
export const atEveryOptions = (atLabel, everyLabel) => [{
  value: 'at',
  label: atLabel
}, {
  value: 'every',
  label: everyLabel
}];
export const everyOptionsNonAdmin = (atLabel, everyLabel) => [{
  value: 'at',
  label: atLabel,
  disabled: true
}, {
  value: 'every',
  label: everyLabel
}];
export const atOptionsNonAdmin = (atLabel, everyLabel) => [{
  value: 'at',
  label: atLabel
}, {
  value: 'every',
  label: everyLabel,
  disabled: true
}];
export const onEveryOptions = (onLabel, everyLabel) => [{
  value: 'on',
  label: onLabel
}, {
  value: 'every',
  label: everyLabel
}];