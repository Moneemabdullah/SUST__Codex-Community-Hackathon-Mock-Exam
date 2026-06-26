import { expect } from 'vitest';

export interface StructuredExpectation {
  relevant_transaction_id?: string | null;
  evidence_verdict?: string;
  case_type?: string;
  department?: string;
  severity?: string;
  human_review_required?: boolean;
}

export const assertStructuredFields = (
  actual: StructuredExpectation,
  expected: StructuredExpectation,
): void => {
  if (expected.relevant_transaction_id !== undefined) {
    expect(actual.relevant_transaction_id).toBe(expected.relevant_transaction_id);
  }
  if (expected.evidence_verdict !== undefined) {
    expect(actual.evidence_verdict).toBe(expected.evidence_verdict);
  }
  if (expected.case_type !== undefined) {
    expect(actual.case_type).toBe(expected.case_type);
  }
  if (expected.department !== undefined) {
    expect(actual.department).toBe(expected.department);
  }
  if (expected.severity !== undefined) {
    expect(actual.severity).toBe(expected.severity);
  }
  if (expected.human_review_required !== undefined) {
    expect(actual.human_review_required).toBe(expected.human_review_required);
  }
};

const asksForCredentials = (text: string): boolean => {
  const withoutSafeWarnings = text
    .toLowerCase()
    .replace(
      /(?:do not|don't|never|not)\s+share\s+(?:your\s+)?(?:pin|otp|password|cvv)[^.?!]*[.?!]?\s*/gi,
      '',
    );

  return (
    /share\s+(?:your\s+)?(?:pin|otp|password|cvv)/.test(withoutSafeWarnings) ||
    /send\s+(?:me\s+)?(?:your\s+)?(?:pin|otp|password|cvv)/.test(withoutSafeWarnings) ||
    /enter\s+(?:your\s+)?(?:pin|otp|password|cvv)/.test(withoutSafeWarnings) ||
    /provide\s+(?:your\s+)?(?:pin|otp|password|cvv)/.test(withoutSafeWarnings)
  );
};

export const assertSafeProse = (reply: string, nextAction: string): void => {
  for (const text of [reply, nextAction]) {
    const lower = text.toLowerCase();
    expect(lower).not.toMatch(/we will refund/);
    expect(lower).not.toMatch(/money will be returned to your account/);
    expect(lower).not.toMatch(/account has been unblocked/);
    expect(asksForCredentials(text)).toBe(false);
  }
};

export const assertBanglaReply = (reply: string): void => {
  expect(reply).toMatch(/[\u0980-\u09FF]/);
};

export const assertUnsafePatternsAbsent = (
  text: string,
  patterns: string[],
): void => {
  const lower = text.toLowerCase();
  const withoutCredentialWarnings = lower.replace(
    /(?:do not|don't|never|not)\s+share\s+your\s+(?:pin|otp|password)[^.?!]*[.?!]?\s*/gi,
    '',
  );

  for (const pattern of patterns) {
    const needle = pattern.toLowerCase();
    if (needle.includes('share your')) {
      expect(withoutCredentialWarnings).not.toContain(needle);
    } else {
      expect(lower).not.toContain(needle);
    }
  }
};
