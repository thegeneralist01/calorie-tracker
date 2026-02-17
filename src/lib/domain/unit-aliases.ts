export const CANONICAL_UNITS = ['g', 'ml', 'serving', 'piece'] as const;

export type CanonicalUnit = (typeof CANONICAL_UNITS)[number];

export type UnitAlias = {
  fromAmount: number;
  fromUnit: string;
  toAmount: number;
  toUnit: string;
};

export function normalizeUnitName(value: string) {
  return value.trim().toLowerCase();
}

export function isCanonicalUnit(value: string): value is CanonicalUnit {
  return (CANONICAL_UNITS as readonly string[]).includes(value);
}

export function normalizeUnitAliases(aliases: UnitAlias[]) {
  return aliases.map((alias) => ({
    fromAmount: alias.fromAmount,
    fromUnit: normalizeUnitName(alias.fromUnit),
    toAmount: alias.toAmount,
    toUnit: normalizeUnitName(alias.toUnit)
  }));
}

export function validateUnitAliases(aliases: UnitAlias[]) {
  const normalized = normalizeUnitAliases(aliases);
  const aliasUnits = new Set<string>();

  for (const alias of normalized) {
    if (!alias.fromUnit || !alias.toUnit) {
      return { ok: false as const, error: 'Alias units must be non-empty.' };
    }

    if (isCanonicalUnit(alias.fromUnit)) {
      return { ok: false as const, error: `Cannot redefine canonical unit "${alias.fromUnit}".` };
    }

    if (alias.fromUnit === alias.toUnit) {
      return { ok: false as const, error: `Alias "${alias.fromUnit}" cannot reference itself.` };
    }

    if (aliasUnits.has(alias.fromUnit)) {
      return { ok: false as const, error: `Duplicate alias unit "${alias.fromUnit}".` };
    }

    aliasUnits.add(alias.fromUnit);
  }

  for (const alias of normalized) {
    if (!isCanonicalUnit(alias.toUnit) && !aliasUnits.has(alias.toUnit)) {
      return {
        ok: false as const,
        error: `Alias "${alias.fromUnit}" references unknown unit "${alias.toUnit}".`
      };
    }
  }

  const graph = new Map<string, string>();
  for (const alias of normalized) {
    if (!isCanonicalUnit(alias.toUnit)) {
      graph.set(alias.fromUnit, alias.toUnit);
    }
  }

  for (const start of graph.keys()) {
    const seen = new Set<string>();
    let cursor: string | undefined = start;
    while (cursor) {
      if (seen.has(cursor)) {
        return { ok: false as const, error: 'Alias cycle detected.' };
      }
      seen.add(cursor);
      cursor = graph.get(cursor);
    }
  }

  return { ok: true as const, aliases: normalized };
}

export function resolveToCanonicalUnit(
  amount: number,
  unit: string,
  aliases: UnitAlias[]
) {
  const validation = validateUnitAliases(aliases);
  if (!validation.ok) {
    return { ok: false as const, error: validation.error };
  }

  const aliasMap = new Map(
    validation.aliases.map((alias) => [alias.fromUnit, alias] as const)
  );
  let resolvedAmount = amount;
  let resolvedUnit = normalizeUnitName(unit);
  const seen = new Set<string>();

  while (!isCanonicalUnit(resolvedUnit)) {
    if (seen.has(resolvedUnit)) {
      return { ok: false as const, error: 'Alias cycle detected during conversion.' };
    }
    seen.add(resolvedUnit);

    const alias = aliasMap.get(resolvedUnit);
    if (!alias) {
      return { ok: false as const, error: `Unknown unit "${resolvedUnit}".` };
    }

    resolvedAmount = resolvedAmount * (alias.toAmount / alias.fromAmount);
    resolvedUnit = alias.toUnit;
  }

  return {
    ok: true as const,
    amount: resolvedAmount,
    unit: resolvedUnit
  };
}

export function parseUnitAliasesJson(value: string | null | undefined): UnitAlias[] {
  if (!value) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  const aliases: UnitAlias[] = [];
  for (const row of parsed) {
    if (
      typeof row?.fromAmount === 'number' &&
      typeof row?.fromUnit === 'string' &&
      typeof row?.toAmount === 'number' &&
      typeof row?.toUnit === 'string'
    ) {
      aliases.push({
        fromAmount: row.fromAmount,
        fromUnit: row.fromUnit,
        toAmount: row.toAmount,
        toUnit: row.toUnit
      });
    }
  }

  return aliases;
}
