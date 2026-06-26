import {
  CASE_TYPE,
  EVIDENCE_VERDICT,
  SEVERITY,
  type CaseType,
  type EvidenceVerdict,
  type Severity,
} from '../../../constants/ticket.constants.js';

export interface SeverityInput {
  caseType: CaseType;
  evidenceVerdict: EvidenceVerdict;
  amount: number;
  ambiguous: boolean;
}

export const computeSeverity = ({
  caseType,
  evidenceVerdict,
  amount,
  ambiguous,
}: SeverityInput): Severity => {
  if (caseType === CASE_TYPE.PHISHING) {
    return SEVERITY.CRITICAL;
  }

  if (caseType === CASE_TYPE.OTHER) {
    return SEVERITY.LOW;
  }

  if (ambiguous && caseType === CASE_TYPE.WRONG_TRANSFER) {
    return SEVERITY.MEDIUM;
  }

  if (caseType === CASE_TYPE.WRONG_TRANSFER) {
    return evidenceVerdict === EVIDENCE_VERDICT.INCONSISTENT
      ? SEVERITY.MEDIUM
      : SEVERITY.HIGH;
  }

  if (caseType === CASE_TYPE.PAYMENT_FAILED || caseType === CASE_TYPE.DUPLICATE_PAYMENT) {
    return SEVERITY.HIGH;
  }

  if (caseType === CASE_TYPE.REFUND_REQUEST) {
    return SEVERITY.LOW;
  }

  if (caseType === CASE_TYPE.AGENT_CASH_IN_ISSUE) {
    return SEVERITY.HIGH;
  }

  if (caseType === CASE_TYPE.MERCHANT_SETTLEMENT_DELAY) {
    return SEVERITY.MEDIUM;
  }

  if (amount >= 50_000) {
    return SEVERITY.HIGH;
  }

  return SEVERITY.MEDIUM;
};
