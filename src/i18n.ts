import enLocale from './localization/enLocale';
import zhCNLocale from './localization/zhCNLocale';
import type { definedLocalesMap } from './types';

export const supportedLanguages: definedLocalesMap = {
  en: enLocale,
  zh_CN: zhCNLocale,
};
