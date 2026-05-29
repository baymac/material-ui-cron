import { useAtom, useAtomValue } from 'jotai';
import FieldRow from '../components/FieldRow';
import SegmentedControl from '../components/SegmentedControl';
import ToggleChipGroup from '../components/ToggleChipGroup';
import { getMonthOptions } from '../constants';
import { localeString } from '../localization/strings';
import { localeState, monthState } from '../store';
import type { SelectOptions } from '../types';

export default function Month() {
  const [month, setMonth] = useAtom(monthState);
  const resolvedLocale = useAtomValue(localeState);
  const allMonths = getMonthOptions(resolvedLocale.shortMonthOptions);

  // "Every month" = all 12 selected (cron `*`). "On" = a specific subset.
  const modeOptions: SelectOptions[] = [
    { value: 'every', label: localeString(resolvedLocale, 'everyMonthLabel') },
    { value: 'on', label: resolvedLocale.onOptionLabel },
  ];
  const mode = month.length >= allMonths.length ? 'every' : 'on';

  const handleMode = (option: SelectOptions) => {
    if (option.value === 'every') {
      setMonth(allMonths);
    } else if (mode === 'every') {
      // every -> on: collapse to a single month so it becomes a real subset.
      setMonth([allMonths[0]]);
    }
  };

  return (
    <FieldRow label={resolvedLocale.monthLabel}>
      <SegmentedControl
        ariaLabel={resolvedLocale.monthLabel}
        options={modeOptions}
        value={modeOptions.find((option) => option.value === mode) ?? modeOptions[0]}
        setValue={handleMode}
      />
      {mode === 'on' && (
        <ToggleChipGroup
          ariaLabel={resolvedLocale.monthLabel}
          options={allMonths}
          value={month}
          onChange={setMonth}
          disableEmpty
          sort
        />
      )}
    </FieldRow>
  );
}
