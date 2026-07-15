export function stableShuffle<T>(items: T[], seed: string) {
  return items
    .map((item, index) => ({
      item,
      order: seededValue(`${seed}:${index}:${String(item)}`),
    }))
    .sort((left, right) => left.order - right.order)
    .map(({ item }) => item);
}

function seededValue(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}
