/**
 * Inclusive numeric range as zero-padded-free string values: `range(0, 3)` →
 * `['0','1','2','3']`. Lives in its own module (with no other imports) so both
 * `constants.ts` and `utils.ts` can use it without forming an import cycle
 * between them.
 */
export function range(start: number, end: number, step = 1): Array<string> {
  const len = Math.floor((end - start) / step) + 1;
  return Array(len)
    .fill('00')
    .map((_, idx) => `${start + idx * step}`);
}
