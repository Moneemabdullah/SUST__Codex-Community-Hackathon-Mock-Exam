import {
  CREDENTIAL_PATTERNS,
  INJECTION_PATTERNS,
  REFUND_PATTERNS,
  SAFE_CREDENTIALS,
  SAFE_REFUND,
  SAFE_URL_REPLACEMENT,
  URL_RE,
} from './patterns.js';

export const stripInjection = (text: string): string => {
  let result = text;
  for (const pattern of INJECTION_PATTERNS) {
    result = result.replace(pattern, '[removed]');
  }
  return result;
};

const scrubCredentials = (text: string): string =>
  CREDENTIAL_PATTERNS.some((pattern) => pattern.test(text)) ? SAFE_CREDENTIALS : text;

const scrubRefund = (text: string): string =>
  REFUND_PATTERNS.some((pattern) => pattern.test(text)) ? SAFE_REFUND : text;

const scrubUrls = (text: string, domain?: string): string => {
  if (!domain) {
    return text.replace(URL_RE, SAFE_URL_REPLACEMENT);
  }

  return text.replace(URL_RE, (url) =>
    url.toLowerCase().includes(domain.toLowerCase()) ? url : SAFE_URL_REPLACEMENT,
  );
};

export const sanitizeUserComplaint = (complaint: string): string =>
  stripInjection(complaint).trim();

export const sanitizeCustomerReply = (reply: string, domain?: string): string =>
  scrubUrls(scrubRefund(scrubCredentials(stripInjection(reply))), domain).trim();

export const sanitizeNextAction = (action: string, domain?: string): string =>
  scrubUrls(scrubRefund(stripInjection(action)), domain).trim();

export const sanitizeAgentSummary = (summary: string): string => stripInjection(summary).trim();

export type SafetyRule = 'S1' | 'S2' | '';

export const isSafetyViolation = (text: string): { violation: boolean; rule: SafetyRule } => {
  if (CREDENTIAL_PATTERNS.some((pattern) => pattern.test(text))) {
    return { violation: true, rule: 'S1' };
  }

  if (REFUND_PATTERNS.some((pattern) => pattern.test(text))) {
    return { violation: true, rule: 'S2' };
  }

  return { violation: false, rule: '' };
};
