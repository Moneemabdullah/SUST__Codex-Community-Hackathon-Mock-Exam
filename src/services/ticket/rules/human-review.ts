import {
  CASE_TYPE,
  EVIDENCE_VERDICT,
  SEVERITY,
  type CaseType,
  type EvidenceVerdict,
  type Severity,
} from '../../../constants/ticket.constants.js';

export interface HumanReviewInput {
  caseType: CaseType;
  evidenceVerdict: EvidenceVerdict;
  severity: Severity;
  amount: number;
  vague: boolean;
  ambiguous: boolean;
}

export const computeHumanReviewRequired = ({
  caseType,
  evidenceVerdict,
  severity,
  amount,
  vague,
  ambiguous,
}: HumanReviewInput): boolean => {
  if (vague || ambiguous) {
    return false;
  }

  if (caseType === CASE_TYPE.PHISHING) {
    return true;
  }

  if (caseType === CASE_TYPE.WRONG_TRANSFER) {
    return true;
  }

  if (evidenceVerdict === EVIDENCE_VERDICT.INCONSISTENT) {
    return true;
  }

  if (caseType === CASE_TYPE.DUPLICATE_PAYMENT) {
    return true;
  }

  if (caseType === CASE_TYPE.AGENT_CASH_IN_ISSUE) {
    return true;
  }

  if (amount >= 50_000) {
    return true;
  }

  if (severity === SEVERITY.CRITICAL) {
    return true;
  }

  if (caseType === CASE_TYPE.PAYMENT_FAILED && evidenceVerdict === EVIDENCE_VERDICT.CONSISTENT) {
    return false;
  }

  if (caseType === CASE_TYPE.REFUND_REQUEST && severity === SEVERITY.LOW) {
    return false;
  }

  if (caseType === CASE_TYPE.MERCHANT_SETTLEMENT_DELAY) {
    return false;
  }

  return false;
};
