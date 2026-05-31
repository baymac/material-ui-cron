import { useAtom, useAtomValue } from 'jotai';
import CustomSelect from '../components/CustomSelect';
import FieldRow from '../components/FieldRow';
import SectionTag from '../components/SectionTag';
import { weekOptions as defaultWeekOptions } from '../constants';
import { localeState, weekState } from '../store';

export default function Week() {
  const [week, setWeek] = useAtom(weekState);
  const resolvedLocale = useAtomValue(localeState);
  const weekOptions = defaultWeekOptions(resolvedLocale.weekDaysOptions);

  return (
    <FieldRow headerSlot={<SectionTag>{resolvedLocale.onText}</SectionTag>}>
      <CustomSelect
        size='lg'
        options={weekOptions}
        label='Week Days'
        value={week}
        setValue={setWeek}
        multiple
        sort
        disableEmpty
        disableClearable={week.length < 2}
      />
    </FieldRow>
  );
}
