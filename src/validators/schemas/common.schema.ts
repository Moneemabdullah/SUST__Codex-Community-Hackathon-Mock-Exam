import { z } from 'zod';

export const nonEmptyString = z.string().trim().min(1);

export const isoDateString = z
  .string()
  .datetime({ offset: true })
  .or(z.string().date())
  .describe('ISO-8601 date or datetime string');

export const idString = z.string().min(1).max(128);

export const safeAmount = z
  .number()
  .finite()
  .refine((n) => Number.isFinite(n), { message: 'Amount must be a finite number' });

export const currencyCode = z.string().regex(/^[A-Z]{3}$/, 'Expected ISO-4217 currency code');

export const channel = z.enum(['email', 'chat', 'phone', 'web', 'other']);

export const priority = z.enum(['low', 'medium', 'high', 'critical']);