import { useAtom, useAtomValue } from 'jotai';
import FieldRow from '../components/FieldRow';
import ToggleChipGroup from '../components/ToggleChipGroup';
import { weekOptions } from '../constants';
import { localeState, weekState } from '../store';

export default function Week() {
  const [week, setWeek] = useAtom(weekState);
  const resolvedLocale = useAtomValue(localeState);
  const allDays = weekOptions(resolvedLocale.weekDaysOptions);

  return (
    <FieldRow label={resolvedLocale.dayOfWeekLabel}>
      <ToggleChipGroup
        ariaLabel='Week Days'
        options={allDays}
        value={week}
        onChange={setWeek}
        disableEmpty
        sort
      />
    </FieldRow>
  );
}
