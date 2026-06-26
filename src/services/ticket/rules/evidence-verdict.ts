import {
  CASE_TYPE,
  EVIDENCE_VERDICT,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
  type CaseType,
  type EvidenceVerdict,
} from '../../../constants/ticket.constants.js';
import type { TransactionHistoryEntry } from '../../../types/ticket.types.js';

export interface EvidenceVerdictInput {
  caseType: CaseType;
  selected: TransactionHistoryEntry | null;
  history: TransactionHistoryEntry[];
  ambiguous: boolean;
}

export const computeEvidenceVerdict = ({
  caseType,
  selected,
  history,
  ambiguous,
}: EvidenceVerdictInput): EvidenceVerdict => {
  if (!selected || ambiguous) {
    return EVIDENCE_VERDICT.INSUFFICIENT_DATA;
  }

  if (caseType === CASE_TYPE.WRONG_TRANSFER) {
    const priorTransfers = history.filter(
      (txn) =>
        txn.transaction_id !== selected.transaction_id &&
        txn.counterparty === selected.counterparty &&
        txn.type === TRANSACTION_TYPE.TRANSFER &&
        txn.status === TRANSACTION_STATUS.COMPLETED,
    );

    if (priorTransfers.length >= 2) {
      return EVIDENCE_VERDICT.INCONSISTENT;
    }

    return EVIDENCE_VERDICT.CONSISTENT;
  }

  if (caseType === CASE_TYPE.PAYMENT_FAILED && selected.status === TRANSACTION_STATUS.FAILED) {
    return EVIDENCE_VERDICT.CONSISTENT;
  }

  if (
    caseType === CASE_TYPE.AGENT_CASH_IN_ISSUE &&
    selected.type === TRANSACTION_TYPE.CASH_IN
  ) {
    return EVIDENCE_VERDICT.CONSISTENT;
  }

  if (
    caseType === CASE_TYPE.MERCHANT_SETTLEMENT_DELAY &&
    selected.type === TRANSACTION_TYPE.SETTLEMENT
  ) {
    return EVIDENCE_VERDICT.CONSISTENT;
  }

  if (
    caseType === CASE_TYPE.REFUND_REQUEST ||
    caseType === CASE_TYPE.DUPLICATE_PAYMENT
  ) {
    return EVIDENCE_VERDICT.CONSISTENT;
  }

  return EVIDENCE_VERDICT.CONSISTENT;
};
