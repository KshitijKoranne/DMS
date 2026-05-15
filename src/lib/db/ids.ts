export function makeId(prefix: string) {
  const random = crypto.randomUUID().slice(0, 8).toUpperCase();
  return `${prefix}-${random}`;
}

export function makeHash(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0").slice(0, 12);
}
