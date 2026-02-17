import { dictionaries } from './dictionaries';

export function resolveLocale(value: string | null | undefined): 'en' | 'de' {
  return value === 'de' ? 'de' : 'en';
}

export function getDictionary(locale: string | null | undefined) {
  return dictionaries[resolveLocale(locale)];
}
