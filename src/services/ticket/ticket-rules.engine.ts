import {
  CASE_TYPE,
  DEPARTMENT,
  EVIDENCE_VERDICT,
  SEVERITY,
} from '../../constants/ticket.constants.js';
import type { TicketAnalysisRequest } from '../../types/ticket.types.js';
import {
  classifyComplaint,
  isPhishingComplaint,
  isVagueComplaint,
} from './rules/classify-complaint.js';
import { computeEvidenceVerdict } from './rules/evidence-verdict.js';
import { computeHumanReviewRequired } from './rules/human-review.js';
import { matchTransactions } from './rules/match-transaction.js';
import { routeDepartment } from './rules/route-department.js';
import { computeSeverity } from './rules/severity.js';
import type { StructuredAnalysis } from './rules/types.js';

const buildReasonCodes = (
  analysis: Pick<
    StructuredAnalysis,
    'case_type' | 'evidence_verdict' | 'relevant_transaction_id'
  > & { vague: boolean; ambiguous: boolean },
): string[] => {
  const codes: string[] = [];

  if (analysis.vague) {
    codes.push('vague_complaint', 'needs_clarification');
    return codes;
  }

  if (analysis.case_type === CASE_TYPE.PHISHING) {
    codes.push('phishing', 'credential_protection', 'critical_escalation');
    return codes;
  }

  if (analysis.ambiguous) {
    codes.push('ambiguous_match', 'needs_clarification');
    return codes;
  }

  codes.push(analysis.case_type);

  if (analysis.relevant_transaction_id) {
    codes.push('transaction_match');
  }

  if (analysis.evidence_verdict === EVIDENCE_VERDICT.INCONSISTENT) {
    codes.push('established_recipient_pattern', 'evidence_inconsistent');
  }

  if (analysis.case_type === CASE_TYPE.WRONG_TRANSFER && analysis.relevant_transaction_id) {
    codes.push('dispute_initiated');
  }

  if (analysis.case_type === CASE_TYPE.PAYMENT_FAILED) {
    codes.push('potential_balance_deduction');
  }

  if (analysis.case_type === CASE_TYPE.REFUND_REQUEST) {
    codes.push('merchant_policy_dependent');
  }

  if (analysis.case_type === CASE_TYPE.AGENT_CASH_IN_ISSUE) {
    codes.push('agent_cash_in', 'pending_transaction', 'agent_ops');
  }

  if (analysis.case_type === CASE_TYPE.MERCHANT_SETTLEMENT_DELAY) {
    codes.push('merchant_settlement', 'delay', 'pending');
  }

  if (analysis.case_type === CASE_TYPE.DUPLICATE_PAYMENT) {
    codes.push('duplicate_payment', 'biller_verification_required');
  }

  return [...new Set(codes)];
};

const buildConfidence = (input: {
  vague: boolean;
  ambiguous: boolean;
  caseType: StructuredAnalysis['case_type'];
  evidenceVerdict: StructuredAnalysis['evidence_verdict'];
  hasMatch: boolean;
}): number => {
  if (input.vague) {
    return 0.6;
  }

  if (input.caseType === CASE_TYPE.PHISHING) {
    return 0.95;
  }

  if (input.ambiguous) {
    return 0.65;
  }

  if (input.evidenceVerdict === EVIDENCE_VERDICT.INCONSISTENT) {
    return 0.75;
  }

  if (input.caseType === CASE_TYPE.MERCHANT_SETTLEMENT_DELAY) {
    return 0.92;
  }

  if (input.caseType === CASE_TYPE.DUPLICATE_PAYMENT) {
    return 0.93;
  }

  if (input.caseType === CASE_TYPE.AGENT_CASH_IN_ISSUE) {
    return 0.88;
  }

  if (input.caseType === CASE_TYPE.REFUND_REQUEST) {
    return 0.85;
  }

  if (input.hasMatch) {
    return 0.9;
  }

  return 0.7;
};

const buildPhishingAnalysis = (): StructuredAnalysis => ({
  relevant_transaction_id: null,
  evidence_verdict: EVIDENCE_VERDICT.INSUFFICIENT_DATA,
  case_type: CASE_TYPE.PHISHING,
  severity: SEVERITY.CRITICAL,
  department: DEPARTMENT.FRAUD_RISK,
  human_review_required: true,
  confidence: 0.95,
  reason_codes: ['phishing', 'credential_protection', 'critical_escalation'],
});

const buildVagueAnalysis = (): StructuredAnalysis => ({
  relevant_transaction_id: null,
  evidence_verdict: EVIDENCE_VERDICT.INSUFFICIENT_DATA,
  case_type: CASE_TYPE.OTHER,
  severity: SEVERITY.LOW,
  department: DEPARTMENT.CUSTOMER_SUPPORT,
  human_review_required: false,
  confidence: 0.6,
  reason_codes: ['vague_complaint', 'needs_clarification'],
});

export const analyzeStructured = (request: TicketAnalysisRequest): StructuredAnalysis => {
  const history = request.transaction_history ?? [];
  const vague = isVagueComplaint(request.complaint);

  if (isPhishingComplaint(request.complaint)) {
    return buildPhishingAnalysis();
  }

  if (vague) {
    return buildVagueAnalysis();
  }

  const caseType = classifyComplaint({
    complaint: request.complaint,
    language: request.language,
    user_type: request.user_type,
    channel: request.channel,
  });

  const match = matchTransactions({
    complaint: request.complaint,
    caseType,
    history,
  });

  const evidenceVerdict = computeEvidenceVerdict({
    caseType,
    selected: match.selected,
    history,
    ambiguous: match.ambiguous,
  });

  const amount = match.selected?.amount ?? 0;
  const severity = computeSeverity({
    caseType,
    evidenceVerdict,
    amount,
    ambiguous: match.ambiguous,
  });

  const department = routeDepartment(caseType, severity, evidenceVerdict);
  const humanReviewRequired = computeHumanReviewRequired({
    caseType,
    evidenceVerdict,
    severity,
    amount,
    vague,
    ambiguous: match.ambiguous,
  });

  const analysis: StructuredAnalysis = {
    relevant_transaction_id: match.selected?.transaction_id ?? null,
    evidence_verdict: evidenceVerdict,
    case_type: caseType,
    severity,
    department,
    human_review_required: humanReviewRequired,
    confidence: buildConfidence({
      vague,
      ambiguous: match.ambiguous,
      caseType,
      evidenceVerdict,
      hasMatch: match.selected !== null,
    }),
    reason_codes: buildReasonCodes({
      case_type: caseType,
      evidence_verdict: evidenceVerdict,
      relevant_transaction_id: match.selected?.transaction_id ?? null,
      vague,
      ambiguous: match.ambiguous,
    }),
  };

  return analysis;
};
