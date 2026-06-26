/**
 * Returns a function that, when called, gives the elapsed milliseconds
 * since the moment `startTimer()` was invoked.
 *
 * Uses `process.hrtime.bigint()` for monotonic timing.
 */
export const startTimer = (): (() => number) => {
  const start = process.hrtime.bigint();
  return () => {
    const elapsedNs = process.hrtime.bigint() - start;
    // Round to whole milliseconds while keeping the value a number for JSON.
    return Number(elapsedNs / 1_000_000n);
  };
};