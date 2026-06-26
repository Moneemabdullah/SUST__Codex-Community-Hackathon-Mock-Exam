/** Problem statement §7 — exact enum strings (case-sensitive). */

export const EVIDENCE_VERDICT = {
  CONSISTENT: 'consistent',
  INCONSISTENT: 'inconsistent',
  INSUFFICIENT_DATA: 'insufficient_data',
} as const;

export const CASE_TYPE = {
  WRONG_TRANSFER: 'wrong_transfer',
  PAYMENT_FAILED: 'payment_failed',
  REFUND_REQUEST: 'refund_request',
  DUPLICATE_PAYMENT: 'duplicate_payment',
  MERCHANT_SETTLEMENT_DELAY: 'merchant_settlement_delay',
  AGENT_CASH_IN_ISSUE: 'agent_cash_in_issue',
  PHISHING: 'phishing_or_social_engineering',
  OTHER: 'other',
} as const;

export const SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const DEPARTMENT = {
  CUSTOMER_SUPPORT: 'customer_support',
  DISPUTE_RESOLUTION: 'dispute_resolution',
  PAYMENTS_OPS: 'payments_ops',
  MERCHANT_OPERATIONS: 'merchant_operations',
  AGENT_OPERATIONS: 'agent_operations',
  FRAUD_RISK: 'fraud_risk',
} as const;

export const LANGUAGE = { EN: 'en', BN: 'bn', MIXED: 'mixed' } as const;

export const CHANNEL = {
  IN_APP_CHAT: 'in_app_chat',
  CALL_CENTER: 'call_center',
  EMAIL: 'email',
  MERCHANT_PORTAL: 'merchant_portal',
  FIELD_AGENT: 'field_agent',
} as const;

export const USER_TYPE = {
  CUSTOMER: 'customer',
  MERCHANT: 'merchant',
  AGENT: 'agent',
  UNKNOWN: 'unknown',
} as const;

export const TRANSACTION_TYPE = {
  TRANSFER: 'transfer',
  PAYMENT: 'payment',
  CASH_IN: 'cash_in',
  CASH_OUT: 'cash_out',
  SETTLEMENT: 'settlement',
  REFUND: 'refund',
} as const;

export const TRANSACTION_STATUS = {
  COMPLETED: 'completed',
  FAILED: 'failed',
  PENDING: 'pending',
  REVERSED: 'reversed',
} as const;

export type EvidenceVerdict = (typeof EVIDENCE_VERDICT)[keyof typeof EVIDENCE_VERDICT];
export type CaseType = (typeof CASE_TYPE)[keyof typeof CASE_TYPE];
export type Severity = (typeof SEVERITY)[keyof typeof SEVERITY];
export type Department = (typeof DEPARTMENT)[keyof typeof DEPARTMENT];
export type Language = (typeof LANGUAGE)[keyof typeof LANGUAGE];
export type Channel = (typeof CHANNEL)[keyof typeof CHANNEL];
export type UserType = (typeof USER_TYPE)[keyof typeof USER_TYPE];
export type TransactionType = (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE];
export type TransactionStatus = (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS];

/** Coerce a const enum object into a Zod-compatible tuple. */
export const enumValues = <T extends Record<string, string>>(
  obj: T,
): [T[keyof T], ...T[keyof T][]] => Object.values(obj) as [T[keyof T], ...T[keyof T][]];
