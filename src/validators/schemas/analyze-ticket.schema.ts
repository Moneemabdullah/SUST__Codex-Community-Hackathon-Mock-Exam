import { z } from 'zod';
import { channel, currencyCode, idString, isoDateString, nonEmptyString, safeAmount } from './common.schema.js';

/**
 * Skeleton schema for the analyze-ticket request.
 *
 * It is intentionally permissive at the scaffold stage: it enforces the
 * shape, types, and obvious invariants (non-empty strings, finite amounts,
 * ISO-4217 currency, known channels) but it does not yet encode any
 * business rules. Those will be layered in once the spec is approved.
 */
export const analyzeTicketRequestSchema = z.object({
  complaint: z.object({
    ticketId: idString,
    subject: nonEmptyString.max(200),
    description: nonEmptyString.max(8000),
    channel,
    receivedAt: isoDateString,
  }),
  transactions: z.array(
    z.object({
      id: idString,
      date: isoDateString,
      amount: safeAmount,
      currency: currencyCode,
      description: nonEmptyString.max(500),
      merchant: nonEmptyString.max(200).optional(),
    }),
  ),
});

export type AnalyzeTicketRequestDto = z.infer<typeof analyzeTicketRequestSchema>;