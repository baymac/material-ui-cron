import { SelectOptions } from './types';
export declare const generateOrdinalOptions: (start: number, end: number) => SelectOptions[];
export declare const getPeriodOptions: (periodOptionLabels: string[]) => SelectOptions[];
export declare const getPeriodOptionsWithHourDisabled: (periodOptionLabels: string[]) => SelectOptions[];
export declare const weekOptions: (weekDayLabels: string[]) => SelectOptions[];
export declare const defaultDayOfMonthOptions: () => {
    value: string;
    label: string;
}[];
export declare const defaultDayOfMonthOptionsWithOrdinal: () => SelectOptions[];
export declare const getLastDayOfMonthOption: (lastDayOfMonthLabel: string) => {
    value: string;
    label: string;
};
export declare const getDayOfMonthsOptionsWithL: (lastDayOfMonthLabel: string) => SelectOptions[];
export declare const DEFAULT_DAY_OF_MONTH_OPTS_WITH_ORD: SelectOptions[];
export declare const DEFAULT_DAY_OF_MONTH_OPTS: {
    value: string;
    label: string;
}[];
export declare const getMonthOptions: (monthOptionLabels: string[]) => {
    value: string;
    label: string;
}[];
export declare const defaultHourOptionsHr: () => {
    value: string;
    label: string;
}[];
export declare const defaultHourOptions: (type?: string | undefined) => {
    disabled?: boolean | undefined;
    value: string;
    label: string;
}[];
export declare const DEFAULT_HOUR_OPTS_AT: {
    disabled?: boolean | undefined;
    value: string;
    label: string;
}[];
export declare const DEFAULT_HOUR_OPTS_EVERY: {
    disabled?: boolean | undefined;
    value: string;
    label: string;
}[];
export declare const defaultMinuteOptions: () => SelectOptions[];
export declare const defaultMinuteOptionsWithOrdinal: () => SelectOptions[];
export declare const DEFAULT_MINUTE_OPTS: SelectOptions[];
export declare const atEveryOptions: (atLabel: string, everyLabel: string) => SelectOptions[];
export declare const everyOptionsNonAdmin: (atLabel: string, everyLabel: string) => SelectOptions[];
export declare const atOptionsNonAdmin: (atLabel: string, everyLabel: string) => SelectOptions[];
export declare const onEveryOptions: (onLabel: string, everyLabel: string) => SelectOptions[];
