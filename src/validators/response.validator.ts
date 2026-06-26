import {
  CASE_TYPE,
  DEPARTMENT,
  EVIDENCE_VERDICT,
  SEVERITY,
} from '../constants/ticket.constants.js';
import type { TicketAnalysisResponse } from '../types/ticket.types.js';

const REQUIRED_STRINGS = [
  'ticket_id',
  'agent_summary',
  'recommended_next_action',
  'customer_reply',
] as const;

const VERDICTS = new Set(Object.values(EVIDENCE_VERDICT));
const CASE_TYPES = new Set(Object.values(CASE_TYPE));
const SEVERITIES = new Set(Object.values(SEVERITY));
const DEPARTMENTS = new Set(Object.values(DEPARTMENT));

const ENUM_CHECKS: [keyof TicketAnalysisResponse, Set<string>][] = [
  ['evidence_verdict', VERDICTS],
  ['case_type', CASE_TYPES],
  ['severity', SEVERITIES],
  ['department', DEPARTMENTS],
];

export interface ResponseValidationResult {
  valid: boolean;
  errors: string[];
}

export const validateResponse = (resp: TicketAnalysisResponse): ResponseValidationResult => {
  const errors: string[] = [];

  for (const field of REQUIRED_STRINGS) {
    const value = resp[field];
    if (typeof value !== 'string' || !value.trim()) {
      errors.push(`missing or empty: ${field}`);
    }
  }

  if (resp.relevant_transaction_id !== null && typeof resp.relevant_transaction_id !== 'string') {
    errors.push('relevant_transaction_id must be string or null');
  }

  if (typeof resp.human_review_required !== 'boolean') {
    errors.push('human_review_required must be boolean');
  }

  for (const [key, allowed] of ENUM_CHECKS) {
    const value = resp[key];
    if (typeof value !== 'string' || !allowed.has(value)) {
      errors.push(`${String(key)}=${JSON.stringify(value)} invalid`);
    }
  }

  if (resp.confidence !== undefined) {
    if (typeof resp.confidence !== 'number' || resp.confidence < 0 || resp.confidence > 1) {
      errors.push('confidence must be 0-1');
    }
  }

  if (resp.reason_codes !== undefined) {
    if (
      !Array.isArray(resp.reason_codes) ||
      !resp.reason_codes.every((code) => typeof code === 'string')
    ) {
      errors.push('reason_codes must be string[]');
    }
  }

  return { valid: errors.length === 0, errors };
};
