import { z } from 'zod';

import {
  CHANNEL,
  LANGUAGE,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
  USER_TYPE,
  enumValues,
} from '../../constants/ticket.constants.js';

const transactionHistoryEntrySchema = z.object({
  transaction_id: z.string().min(1),
  timestamp: z.string().datetime({ offset: true }),
  type: z.enum(enumValues(TRANSACTION_TYPE)),
  amount: z.number().finite().nonnegative(),
  counterparty: z.string().min(1),
  status: z.enum(enumValues(TRANSACTION_STATUS)),
});

/** Problem statement §5 — inbound analyze-ticket request. */
export const analyzeTicketRequestSchema = z
  .object({
    ticket_id: z.string().min(1),
    complaint: z.string(),
    language: z.enum(enumValues(LANGUAGE)).optional(),
    channel: z.enum(enumValues(CHANNEL)).optional(),
    user_type: z.enum(enumValues(USER_TYPE)).optional(),
    campaign_context: z.string().optional(),
    transaction_history: z.array(transactionHistoryEntrySchema).optional().default([]),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export type AnalyzeTicketRequestDto = z.infer<typeof analyzeTicketRequestSchema>;
export type TransactionHistoryEntryDto = z.infer<typeof transactionHistoryEntrySchema>;
