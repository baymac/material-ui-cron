import { useAtom, useAtomValue } from 'jotai';
import CustomSelect from '../components/CustomSelect';
import FieldRow from '../components/FieldRow';
import { getPeriodOptions, getPeriodOptionsWithHourDisabled } from '../constants';
import { isAdminState, localeState, periodState } from '../store';

export default function Period() {
  const [period, setPeriod] = useAtom(periodState);

  const isAdmin = useAtomValue(isAdminState);

  const resolvedLocale = useAtomValue(localeState);

  return (
    <FieldRow label={resolvedLocale.everyText}>
      <CustomSelect
        size='lg'
        single
        disableClearable
        options={
          isAdmin
            ? getPeriodOptions(resolvedLocale.periodOptions)
            : getPeriodOptionsWithHourDisabled(resolvedLocale.periodOptions)
        }
        label={resolvedLocale.periodLabel}
        value={period}
        setValue={setPeriod}
        multiple={false}
      />
    </FieldRow>
  );
}
