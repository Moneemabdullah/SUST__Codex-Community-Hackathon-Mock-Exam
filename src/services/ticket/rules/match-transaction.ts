import { CASE_TYPE, TRANSACTION_STATUS, TRANSACTION_TYPE, type CaseType } from '../../../constants/ticket.constants.js';
import type { TransactionHistoryEntry } from '../../../types/ticket.types.js';
import {
  counterpartyMatchesPhone,
  extractAmounts,
  extractPhoneNumbers,
  extractTimeHint,
  extractTransactionIds,
} from './complaint-signals.js';
import type { TransactionMatchResult } from './types.js';

const DUPLICATE_WINDOW_MS = 60_000;

const byTimestampDesc = (
  a: TransactionHistoryEntry,
  b: TransactionHistoryEntry,
): number => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();

const byTimestampAsc = (
  a: TransactionHistoryEntry,
  b: TransactionHistoryEntry,
): number => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();

export const findDuplicateTransaction = (
  history: TransactionHistoryEntry[],
): TransactionHistoryEntry | null => {
  const sorted = [...history].sort(byTimestampAsc);

  for (let i = 0; i < sorted.length; i += 1) {
    const earlier = sorted[i];
    if (!earlier) {
      continue;
    }

    for (let j = i + 1; j < sorted.length; j += 1) {
      const later = sorted[j];
      if (!later) {
        continue;
      }

      const deltaMs =
        new Date(later.timestamp).getTime() - new Date(earlier.timestamp).getTime();

      if (deltaMs > DUPLICATE_WINDOW_MS) {
        break;
      }

      if (
        earlier.amount === later.amount &&
        earlier.counterparty === later.counterparty &&
        earlier.type === later.type &&
        earlier.status === TRANSACTION_STATUS.COMPLETED &&
        later.status === TRANSACTION_STATUS.COMPLETED
      ) {
        return later;
      }
    }
  }

  return null;
};

const filterByCaseType = (
  history: TransactionHistoryEntry[],
  caseType: CaseType,
): TransactionHistoryEntry[] => {
  switch (caseType) {
    case CASE_TYPE.WRONG_TRANSFER:
      return history.filter((txn) => txn.type === TRANSACTION_TYPE.TRANSFER);
    case CASE_TYPE.PAYMENT_FAILED:
      return history.filter(
        (txn) =>
          txn.type === TRANSACTION_TYPE.PAYMENT &&
          txn.status === TRANSACTION_STATUS.FAILED,
      );
    case CASE_TYPE.REFUND_REQUEST:
      return history.filter(
        (txn) =>
          txn.type === TRANSACTION_TYPE.PAYMENT &&
          txn.status === TRANSACTION_STATUS.COMPLETED,
      );
    case CASE_TYPE.AGENT_CASH_IN_ISSUE:
      return history.filter((txn) => txn.type === TRANSACTION_TYPE.CASH_IN);
    case CASE_TYPE.MERCHANT_SETTLEMENT_DELAY:
      return history.filter((txn) => txn.type === TRANSACTION_TYPE.SETTLEMENT);
    case CASE_TYPE.DUPLICATE_PAYMENT:
      return history.filter(
        (txn) =>
          txn.type === TRANSACTION_TYPE.PAYMENT &&
          txn.status === TRANSACTION_STATUS.COMPLETED,
      );
    default:
      return history;
  }
};

const scoreByTimeHint = (
  txn: TransactionHistoryEntry,
  hint: ReturnType<typeof extractTimeHint>,
): number => {
  if (!hint) {
    return 0;
  }

  const timestamp = new Date(txn.timestamp);
  let score = 0;

  if (hint.hour !== undefined) {
    const hourDiff = Math.abs(timestamp.getUTCHours() - hint.hour);
    score += Math.max(0, 24 - hourDiff);
  }

  if (hint.dayOffset !== undefined) {
    const now = new Date();
    const target = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + hint.dayOffset),
    );
    const txnDay = new Date(
      Date.UTC(timestamp.getUTCFullYear(), timestamp.getUTCMonth(), timestamp.getUTCDate()),
    );
    if (txnDay.getTime() === target.getTime()) {
      score += 10;
    }
  }

  return score;
};

const isAmbiguousWrongTransfer = (
  phones: string[],
  candidates: TransactionHistoryEntry[],
): boolean => {
  const completed = candidates.filter(
    (txn) => txn.status === TRANSACTION_STATUS.COMPLETED,
  );

  if (completed.length <= 1) {
    return false;
  }

  if (phones.length > 0) {
    const phoneMatches = completed.filter((txn) =>
      phones.some((phone) => counterpartyMatchesPhone(txn.counterparty, phone)),
    );
    return phoneMatches.length !== 1;
  }

  const counterparties = new Set(completed.map((txn) => txn.counterparty));
  return counterparties.size > 1;
};

export interface MatchTransactionsInput {
  complaint: string;
  caseType: CaseType;
  history: TransactionHistoryEntry[];
}

export const matchTransactions = ({
  complaint,
  caseType,
  history,
}: MatchTransactionsInput): TransactionMatchResult => {
  if (caseType === CASE_TYPE.DUPLICATE_PAYMENT) {
    const duplicate = findDuplicateTransaction(history);
    return {
      selected: duplicate,
      ambiguous: false,
      candidates: duplicate ? [duplicate] : [],
    };
  }

  const txnIds = extractTransactionIds(complaint);
  if (txnIds.length > 0) {
    const byId = history.filter((txn) => txnIds.includes(txn.transaction_id));
    if (byId.length === 1) {
      const selected = byId[0];
      if (selected) {
        return { selected, ambiguous: false, candidates: byId };
      }
    }
    if (byId.length > 1) {
      return { selected: null, ambiguous: true, candidates: byId };
    }
  }

  const amounts = extractAmounts(complaint);
  const phones = extractPhoneNumbers(complaint);
  let candidates = filterByCaseType(history, caseType);

  if (amounts.length > 0) {
    const [primaryAmount] = amounts;
    const byAmount = candidates.filter((txn) => txn.amount === primaryAmount);
    if (byAmount.length > 0) {
      candidates = byAmount;
    }
  }

  if (phones.length > 0) {
    const byPhone = candidates.filter((txn) =>
      phones.some((phone) => counterpartyMatchesPhone(txn.counterparty, phone)),
    );
    if (byPhone.length === 1) {
      const selected = byPhone[0];
      if (selected) {
        return { selected, ambiguous: false, candidates: byPhone };
      }
    }
    if (byPhone.length > 1) {
      return { selected: null, ambiguous: true, candidates: byPhone };
    }
  }

  if (candidates.length === 0) {
    return { selected: null, ambiguous: false, candidates: [] };
  }

  if (caseType === CASE_TYPE.WRONG_TRANSFER && isAmbiguousWrongTransfer(phones, candidates)) {
    return { selected: null, ambiguous: true, candidates };
  }

  if (candidates.length === 1) {
    const selected = candidates[0];
    if (selected) {
      return { selected, ambiguous: false, candidates };
    }
  }

  const timeHint = extractTimeHint(complaint);
  if (timeHint && candidates.length > 1) {
    const ranked = [...candidates].sort(
      (a, b) => scoreByTimeHint(b, timeHint) - scoreByTimeHint(a, timeHint),
    );
    const best = ranked[0];
    const second = ranked[1];
    if (best && second) {
      const bestScore = scoreByTimeHint(best, timeHint);
      const secondScore = scoreByTimeHint(second, timeHint);
      if (bestScore > secondScore && bestScore > 0) {
        return { selected: best, ambiguous: false, candidates: ranked };
      }
    }
  }

  if (
    caseType === CASE_TYPE.WRONG_TRANSFER ||
    caseType === CASE_TYPE.PAYMENT_FAILED ||
    caseType === CASE_TYPE.REFUND_REQUEST
  ) {
    const mostRecent = [...candidates].sort(byTimestampDesc)[0];
    if (mostRecent) {
      return { selected: mostRecent, ambiguous: false, candidates };
    }
  }

  if (candidates.length > 1) {
    return { selected: null, ambiguous: true, candidates };
  }

  const fallback = candidates[0];
  return { selected: fallback ?? null, ambiguous: false, candidates };
};
