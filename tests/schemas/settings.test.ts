import { describe, expect, it } from 'vitest';
import { settingsUpdateSchema } from '../../src/lib/schemas/settings';

describe('settingsUpdateSchema', () => {
  it('accepts valid custom unit aliases', () => {
    const parsed = settingsUpdateSchema.safeParse({
      customUnitAliases: [
        { fromAmount: 1, fromUnit: 'cup', toAmount: 240, toUnit: 'ml' },
        { fromAmount: 2, fromUnit: 'scoop', toAmount: 1, toUnit: 'serving' }
      ]
    });

    expect(parsed.success).toBe(true);
  });

  it('rejects invalid alias unit names', () => {
    const parsed = settingsUpdateSchema.safeParse({
      customUnitAliases: [{ fromAmount: 1, fromUnit: 'tea spoon', toAmount: 5, toUnit: 'ml' }]
    });

    expect(parsed.success).toBe(false);
  });
});
