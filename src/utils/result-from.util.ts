import type { Result } from '../types/result.types.js';

/**
 * Builder helpers for `Result<T, E>`. Kept separate from `result.types.ts` so
 * that types file remains type-only (no runtime emit) and ESLint's
 * `consistent-type-imports` rule stays happy.
 */
export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
