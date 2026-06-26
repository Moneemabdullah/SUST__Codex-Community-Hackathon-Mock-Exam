import {
  CASE_TYPE,
  DEPARTMENT,
  EVIDENCE_VERDICT,
  SEVERITY,
  type CaseType,
  type Department,
  type EvidenceVerdict,
  type Severity,
} from '../../../constants/ticket.constants.js';

export const routeDepartment = (
  caseType: CaseType,
  severity: Severity,
  evidenceVerdict: EvidenceVerdict,
): Department => {
  switch (caseType) {
    case CASE_TYPE.PHISHING:
      return DEPARTMENT.FRAUD_RISK;
    case CASE_TYPE.WRONG_TRANSFER:
      return DEPARTMENT.DISPUTE_RESOLUTION;
    case CASE_TYPE.PAYMENT_FAILED:
    case CASE_TYPE.DUPLICATE_PAYMENT:
      return DEPARTMENT.PAYMENTS_OPS;
    case CASE_TYPE.MERCHANT_SETTLEMENT_DELAY:
      return DEPARTMENT.MERCHANT_OPERATIONS;
    case CASE_TYPE.AGENT_CASH_IN_ISSUE:
      return DEPARTMENT.AGENT_OPERATIONS;
    case CASE_TYPE.REFUND_REQUEST:
      if (evidenceVerdict === EVIDENCE_VERDICT.INCONSISTENT) {
        return DEPARTMENT.DISPUTE_RESOLUTION;
      }
      if (severity === SEVERITY.LOW) {
        return DEPARTMENT.CUSTOMER_SUPPORT;
      }
      return DEPARTMENT.CUSTOMER_SUPPORT;
    case CASE_TYPE.OTHER:
    default:
      return DEPARTMENT.CUSTOMER_SUPPORT;
  }
};
