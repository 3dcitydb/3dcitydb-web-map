// Prefer OBJECTID (case-insensitive); otherwise fall back to the first key.
export function findObjectIdKey(keys: readonly string[]): string | undefined {
  return keys.find((k) => k.toUpperCase() === 'OBJECTID') ?? keys[0];
}
