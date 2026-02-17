import { describe, expect, it } from 'vitest';
import {
  parseUnitAliasesJson,
  resolveToCanonicalUnit,
  validateUnitAliases
} from '../../src/lib/domain/unit-aliases';

describe('unit aliases', () => {
  it('resolves alias chains to canonical units', () => {
    const result = resolveToCanonicalUnit(2, 'bowl', [
      { fromAmount: 1, fromUnit: 'bowl', toAmount: 2, toUnit: 'cup' },
      { fromAmount: 1, fromUnit: 'cup', toAmount: 240, toUnit: 'ml' }
    ]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.unit).toBe('ml');
      expect(result.amount).toBe(960);
    }
  });

  it('rejects cyclic aliases', () => {
    const validation = validateUnitAliases([
      { fromAmount: 1, fromUnit: 'cup', toAmount: 1, toUnit: 'bowl' },
      { fromAmount: 1, fromUnit: 'bowl', toAmount: 1, toUnit: 'cup' }
    ]);

    expect(validation.ok).toBe(false);
  });

  it('rejects canonical redefinitions and unknown targets', () => {
    const canonicalRedef = validateUnitAliases([
      { fromAmount: 1, fromUnit: 'ml', toAmount: 1, toUnit: 'g' }
    ]);
    expect(canonicalRedef.ok).toBe(false);

    const unknownTarget = validateUnitAliases([
      { fromAmount: 1, fromUnit: 'cup', toAmount: 1, toUnit: 'mug' }
    ]);
    expect(unknownTarget.ok).toBe(false);
  });

  it('returns conversion error for unknown units', () => {
    const result = resolveToCanonicalUnit(1, 'cup', []);
    expect(result.ok).toBe(false);
  });

  it('parses alias json safely', () => {
    expect(parseUnitAliasesJson(null)).toEqual([]);
    expect(parseUnitAliasesJson('{oops')).toEqual([]);
    expect(
      parseUnitAliasesJson(
        JSON.stringify([{ fromAmount: 1, fromUnit: 'cup', toAmount: 240, toUnit: 'ml' }])
      )
    ).toEqual([{ fromAmount: 1, fromUnit: 'cup', toAmount: 240, toUnit: 'ml' }]);
  });
});
