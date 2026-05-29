import { useAtom, useAtomValue } from 'jotai';
import FieldRow from '../components/FieldRow';
import ToggleChipGroup from '../components/ToggleChipGroup';
import { getMonthOptions } from '../constants';
import { localeState, monthState } from '../store';

export default function Month() {
  const [month, setMonth] = useAtom(monthState);
  const resolvedLocale = useAtomValue(localeState);
  const allMonths = getMonthOptions(resolvedLocale.shortMonthOptions);

  return (
    <FieldRow label={resolvedLocale.monthLabel}>
      <ToggleChipGroup
        ariaLabel={resolvedLocale.monthLabel}
        options={allMonths}
        value={month}
        onChange={setMonth}
        disableEmpty
        sort
      />
    </FieldRow>
  );
}
