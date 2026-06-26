import { CASE_TYPE, type CaseType } from '../../../constants/ticket.constants.js';
import { extractAmounts } from './complaint-signals.js';
import type { ComplaintClassificationContext } from './types.js';

const PHISHING_PATTERNS = [
  /\botp\b/i,
  /\bpin\b/i,
  /\bpassword\b/i,
  /called me/i,
  /call(?:ed)?\s+(?:me|saying)/i,
  /account will be blocked/i,
  /share (?:it|your)/i,
  /social engineering/i,
  /phishing/i,
  /\bscam\b/i,
  /fake.*(?:call|support|company)/i,
  /never ask.*otp/i,
];

const VAGUE_PATTERNS = [
  /something is wrong with my money/i,
  /^something is wrong/i,
  /^please check\.?$/i,
];

export const isPhishingComplaint = (complaint: string): boolean =>
  PHISHING_PATTERNS.some((pattern) => pattern.test(complaint)) ||
  /(ওটিপি|পিন).*(শেয়ার|দিতে|চায়)/.test(complaint);

export const isVagueComplaint = (complaint: string): boolean => {
  const trimmed = complaint.trim();
  if (VAGUE_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return true;
  }

  const amounts = extractAmounts(trimmed);
  const hasSpecificIssue =
    /wrong|failed|refund|duplicate|twice|settlement|cash[\s-]?in|otp|blocked|mistake|deducted|recharge|brother|sister|merchant|agent/i.test(
      trimmed,
    );
  const hasBanglaIssue = /ভুল|ব্যর্থ|রিফান্ড|এজেন্ট|ব্যালেন্স|ক্যাশ/i.test(trimmed);

  return amounts.length === 0 && !hasSpecificIssue && !hasBanglaIssue && trimmed.length < 100;
};

export const classifyComplaint = ({
  complaint,
  language,
  user_type,
}: ComplaintClassificationContext): CaseType => {
  if (isPhishingComplaint(complaint)) {
    return CASE_TYPE.PHISHING;
  }

  if (isVagueComplaint(complaint)) {
    return CASE_TYPE.OTHER;
  }

  const lower = complaint.toLowerCase();

  if (
    /\b(?:twice|duplicate|double|deducted twice|two times|only (?:paid|once)|paid once)\b/i.test(
      lower,
    )
  ) {
    return CASE_TYPE.DUPLICATE_PAYMENT;
  }

  if (
    user_type === 'merchant' ||
    (/\bmerchant\b/i.test(lower) && /\b(?:settlement|settled|sales)\b/i.test(lower)) ||
    /\bsettlement\b/i.test(lower)
  ) {
    return CASE_TYPE.MERCHANT_SETTLEMENT_DELAY;
  }

  if (
    language === 'bn' ||
    /\bcash[\s-]?in\b/i.test(lower) ||
    /ক্যাশ|এজেন্ট|ব্যালেন্স/i.test(complaint)
  ) {
    if (/\bagent\b/i.test(lower) || /ক্যাশ|এজেন্ট|ব্যালেন্স/i.test(complaint)) {
      return CASE_TYPE.AGENT_CASH_IN_ISSUE;
    }
  }

  if (
    /\b(?:failed|failure|showed failed)\b/i.test(lower) &&
    /\b(?:balance|deducted|recharge|payment)\b/i.test(lower)
  ) {
    return CASE_TYPE.PAYMENT_FAILED;
  }

  if (
    /\b(?:refund|changed my mind|don't want|do not want)\b/i.test(lower) &&
    !/\b(?:failed|deducted twice|duplicate)\b/i.test(lower)
  ) {
    return CASE_TYPE.REFUND_REQUEST;
  }

  if (
    /\bwrong transfer\b/i.test(lower) ||
    /\bwrong (?:number|person|recipient)\b/i.test(lower) ||
    /\b(?:mistake|mistaken|typed (?:it )?wrong)\b/i.test(lower) ||
    (/\bsent\b/i.test(lower) &&
      /\b(?:didn't get|did not get|not respond|brother|sister)\b/i.test(lower))
  ) {
    return CASE_TYPE.WRONG_TRANSFER;
  }

  return CASE_TYPE.OTHER;
};
