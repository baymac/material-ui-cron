import React from 'react';
import { useAtom, useAtomValue } from 'jotai';
import CustomSelect from '../components/CustomSelect';
import FieldRow from '../components/FieldRow';
import SectionTag from '../components/SectionTag';
import { getMonthOptions } from '../constants';
import { localeState, monthState } from '../store';

export default function Month() {
  const [month, setMonth] = useAtom(monthState);
  const resolvedLocale = useAtomValue(localeState);
  const [monthOptions, setMonthOptions] = React.useState(
    getMonthOptions(resolvedLocale.shortMonthOptions),
  );

  return (
    <FieldRow headerSlot={<SectionTag>{resolvedLocale.inText}</SectionTag>}>
      <CustomSelect
        size='lg'
        options={monthOptions}
        label={resolvedLocale.monthLabel}
        value={month}
        setValue={setMonth}
        disableClearable
        sort
        disableEmpty
      />
    </FieldRow>
  );
}
