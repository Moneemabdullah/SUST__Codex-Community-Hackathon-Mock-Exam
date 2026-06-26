import type {
  CaseType,
  Department,
  EvidenceVerdict,
  Severity,
} from '../../../constants/ticket.constants.js';
import type { TransactionHistoryEntry } from '../../../types/ticket.types.js';

export interface StructuredAnalysis {
  relevant_transaction_id: string | null;
  evidence_verdict: EvidenceVerdict;
  case_type: CaseType;
  severity: Severity;
  department: Department;
  human_review_required: boolean;
  confidence: number;
  reason_codes: string[];
}

export interface TransactionMatchResult {
  selected: TransactionHistoryEntry | null;
  ambiguous: boolean;
  candidates: TransactionHistoryEntry[];
}

export interface ComplaintClassificationContext {
  complaint: string;
  language?: string;
  user_type?: string;
  channel?: string;
}
