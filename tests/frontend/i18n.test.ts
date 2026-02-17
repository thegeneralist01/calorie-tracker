import { describe, expect, it } from 'vitest';
import { getDictionary, resolveLocale } from '../../src/lib/i18n';

describe('i18n helpers', () => {
  it('resolves unsupported locale to english', () => {
    expect(resolveLocale('fr')).toBe('en');
  });

  it('returns german dictionary for de locale', () => {
    const dict = getDictionary('de');
    expect(dict.navToday).toBe('Heute');
  });
});
