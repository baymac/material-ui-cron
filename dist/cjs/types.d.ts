/// <reference types="react" />
import { AutocompleteRenderGetTagProps } from '@material-ui/core';
import { SetterOrUpdater } from 'recoil';
export declare type PeriodType = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute';
export interface CustomSelectProps {
    renderTags?: (value: SelectOptions[], getTagProps: AutocompleteRenderGetTagProps) => React.ReactNode;
    options: Array<SelectOptions>;
    value: SelectOptions | SelectOptions[];
    setValue: SetterOrUpdater<SelectOptions | SelectOptions[]>;
    noOptionsText?: string;
    label: string;
    size?: 'small' | 'medium';
    disableClearable?: boolean;
    forcePopupIcon?: boolean;
    disabled?: boolean;
    multiple?: boolean;
    filterSelectedOptions?: boolean;
    className?: string;
    classes?: any;
    single?: boolean;
    sort?: boolean;
    disableEmpty?: boolean;
    limitTags?: number;
}
export interface SelectOptions {
    value: string;
    label: string;
    disabled?: boolean;
}
export interface CronAndHrTime {
    hrTime: string;
    cronTime: string;
}
export interface CronValidation {
    isValid: boolean;
    message: string;
}
export interface SchedulerProps {
    cron: string;
    setCron: React.Dispatch<React.SetStateAction<string>>;
    setCronError: React.Dispatch<React.SetStateAction<string>>;
    isAdmin?: boolean;
    locale?: definedLocales;
    customLocale?: Locale;
}
export interface Locale {
    atEveryText: string;
    betweenText: string;
    inText: string;
    onText: string;
    andText: string;
    onEveryText: string;
    everyText: string;
    atOptionLabel: string;
    everyOptionLabel: string;
    periodLabel: string;
    minuteLabel: string;
    monthLabel: string;
    multiDayOfMonthLabel: string;
    dayOfMonthLabel: string;
    hourLabel: string;
    dayOfWeekLabel: string;
    weekDaysOptions: string[];
    periodOptions: string[];
    shortMonthOptions: string[];
    onOptionLabel: string;
    lastDayOfMonthLabel: string;
    cronDescriptionText: 'en' | 'ca' | 'cs' | 'es' | 'da' | 'de' | 'fi' | 'fr' | 'fa' | 'he' | 'it' | 'ja' | 'ko' | 'nb' | 'nl' | 'pl' | 'pt_BR' | 'ro' | 'ru' | 'sk' | 'sl' | 'sw' | 'sv' | 'tr' | 'uk' | 'zh_CN' | 'zh_TW';
}
export declare type definedLocales = 'en' | 'zh_CN';
export declare type definedLocalesMap = Record<definedLocales, Locale>;
