/**
 * Discriminated union representing the outcome of an operation that can fail
 * with a typed error. Used by services to avoid throwing across layer
 * boundaries.
 */
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });