import React from 'react';
import { useAtom, useAtomValue } from 'jotai';
import CustomSelect from '../components/CustomSelect';
import FieldRow from '../components/FieldRow';
import { weekOptions as defaultWeekOptions } from '../constants';
import { localeState, weekState } from '../store';

export default function Week() {
  const [week, setWeek] = useAtom(weekState);
  const resolvedLocale = useAtomValue(localeState);
  const [weekOptions, setWeekOptions] = React.useState(
    defaultWeekOptions(resolvedLocale.weekDaysOptions),
  );

  return (
    <FieldRow label={resolvedLocale.onText}>
      <CustomSelect
        size='lg'
        options={weekOptions}
        label='Week Days'
        value={week}
        setValue={setWeek}
        multiple
        sort
        disableEmpty
        limitTags={3}
        disableClearable={week.length < 2}
      />
    </FieldRow>
  );
}
