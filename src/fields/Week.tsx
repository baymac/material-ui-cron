import { useAtom, useAtomValue } from 'jotai';
import FieldRow from '../components/FieldRow';
import SegmentedControl from '../components/SegmentedControl';
import ToggleChipGroup from '../components/ToggleChipGroup';
import { weekOptions } from '../constants';
import { localeString } from '../localization/strings';
import { localeState, weekState } from '../store';
import type { SelectOptions } from '../types';

export default function Week() {
  const [week, setWeek] = useAtom(weekState);
  const resolvedLocale = useAtomValue(localeState);
  const allDays = weekOptions(resolvedLocale.weekDaysOptions);

  // "Any day" = every weekday selected (cron `*`). "On" = a specific subset.
  // The mode is derived from the selection, so no extra atom is needed.
  const modeOptions: SelectOptions[] = [
    { value: 'any', label: localeString(resolvedLocale, 'anyDayLabel') },
    { value: 'on', label: resolvedLocale.onOptionLabel },
  ];
  const mode = week.length >= allDays.length ? 'any' : 'on';

  const handleMode = (option: SelectOptions) => {
    if (option.value === 'any') {
      setWeek(allDays);
    } else if (mode === 'any') {
      // any -> on: collapse to a single day so it becomes a real subset.
      setWeek([allDays[1] ?? allDays[0]]);
    }
  };

  return (
    <FieldRow label={resolvedLocale.dayOfWeekLabel}>
      <SegmentedControl
        ariaLabel={resolvedLocale.dayOfWeekLabel}
        options={modeOptions}
        value={modeOptions.find((option) => option.value === mode) ?? modeOptions[0]}
        setValue={handleMode}
      />
      {mode === 'on' && (
        <ToggleChipGroup
          ariaLabel='Week Days'
          options={allDays}
          value={week}
          onChange={setWeek}
          disableEmpty
          sort
        />
      )}
    </FieldRow>
  );
}
