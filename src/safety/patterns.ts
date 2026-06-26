export const CREDENTIAL_PATTERNS = [
  /\b(share|send|provide|tell|give|enter|type)\b.{0,20}\b(pin|otp|password|cvv|card\s*number|secret)\b/i,
  /\b(your|my|the)\s+(pin|otp|password|cvv)\b\s*(is|=|:)/i,
  /\bverify\b.{0,15}\b(pin|otp|password)\b/i,
  /(পিন|ওটিপি|পাসওয়ার্ড)/i,
];

export const REFUND_PATTERNS = [
  /\bwe\s+(will|have|shall|are\s+going\s+to)\s+(refund|reverse|return|unblock|credit)\b/i,
  /\b(refund|reversal|return)\s+(has\s+been|will\s+be|is\s+being)\s+(processed|completed|sent|done)\b/i,
  /\bmoney\s+will\s+be\s+(returned|sent|refunded)\s+to\s+your\s+account\b/i,
  /\byour\s+account\s+(has\s+been|is\s+now)\s+unblocked\b/i,
];

export const URL_RE = /https?:\/\/[^\s]+/gi;

export const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/gi,
  /system\s*:\s*/gi,
  /<\s*\|.*?\|>/g,
  /###\s*instruction/gi,
];

export const SAFE_CREDENTIALS =
  'For your security, please do not share your PIN, OTP, password, or card number with anyone — including our team.';

export const SAFE_REFUND =
  'Any eligible amount will be processed through official channels after our team completes verification.';

export const SAFE_URL_REPLACEMENT = '[official support channel]';
