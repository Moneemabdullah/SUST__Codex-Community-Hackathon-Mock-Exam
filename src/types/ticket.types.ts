import type {
  CaseType,
  Channel,
  Department,
  EvidenceVerdict,
  Language,
  Severity,
  TransactionStatus,
  TransactionType,
  UserType,
} from '../constants/ticket.constants.js';

export interface TransactionHistoryEntry {
  transaction_id: string;
  timestamp: string;
  type: TransactionType;
  amount: number;
  counterparty: string;
  status: TransactionStatus;
}

/** Problem statement §5 — analyze-ticket request body. */
export interface TicketAnalysisRequest {
  ticket_id: string;
  complaint: string;
  language?: Language;
  channel?: Channel;
  user_type?: UserType;
  campaign_context?: string;
  transaction_history: TransactionHistoryEntry[];
  metadata?: Record<string, unknown>;
}

/** Problem statement §6 — analyze-ticket response body. */
export interface TicketAnalysisResponse {
  ticket_id: string;
  relevant_transaction_id: string | null;
  evidence_verdict: EvidenceVerdict;
  case_type: CaseType;
  severity: Severity;
  department: Department;
  agent_summary: string;
  recommended_next_action: string;
  customer_reply: string;
  human_review_required: boolean;
  confidence?: number;
  reason_codes?: string[];
}
