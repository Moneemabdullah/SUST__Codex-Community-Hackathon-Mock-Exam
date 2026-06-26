const BANGLA_DIGIT_MAP: Record<string, string> = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

export const normalizeNumerals = (text: string): string =>
  text.replace(/[০-৯]/g, (digit) => BANGLA_DIGIT_MAP[digit] ?? digit);

export const extractAmounts = (complaint: string): number[] => {
  const normalized = normalizeNumerals(complaint);
  const amounts = new Set<number>();

  const patterns = [
    /(\d+(?:\.\d+)?)\s*(?:taka|tk|bdt|টাকা)/gi,
    /(?:taka|tk|bdt|টাকা)\s*(\d+(?:\.\d+)?)/gi,
    /(?:sent|pay|paid|transfer(?:red)?|recharge|sales(?:\s+of)?)\s+(\d+(?:\.\d+)?)/gi,
    /(\d+(?:\.\d+)?)\s+(?:to|for)\b/gi,
  ];

  for (const pattern of patterns) {
    for (const match of normalized.matchAll(pattern)) {
      const value = Number(match[1]);
      if (Number.isFinite(value) && value > 0) {
        amounts.add(value);
      }
    }
  }

  return [...amounts];
};

export const normalizePhone = (value: string): string =>
  value.replace(/[\s-]/g, '').replace(/^\+/, '');

export const extractPhoneNumbers = (complaint: string): string[] => {
  const normalized = normalizeNumerals(complaint);
  const phones = new Set<string>();

  for (const match of normalized.matchAll(/(?:\+?880|0)1\d{9}/g)) {
    phones.add(normalizePhone(match[0]));
  }

  return [...phones];
};

export const extractTransactionIds = (complaint: string): string[] => {
  const ids = new Set<string>();
  for (const match of complaint.matchAll(/\bTXN-\d+\b/gi)) {
    ids.add(match[0].toUpperCase());
  }
  return [...ids];
};

export interface TimeHint {
  hour?: number;
  dayOffset?: number;
}

export const extractTimeHint = (complaint: string): TimeHint | null => {
  const lower = complaint.toLowerCase();
  const hint: TimeHint = {};

  const pmMatch = lower.match(/\b(\d{1,2})\s*pm\b/);
  const amMatch = lower.match(/\b(\d{1,2})\s*am\b/);
  if (pmMatch) {
    const hour = Number(pmMatch[1]);
    hint.hour = hour === 12 ? 12 : hour + 12;
  } else if (amMatch) {
    const hour = Number(amMatch[1]);
    hint.hour = hour === 12 ? 0 : hour;
  }

  if (/\byesterday\b/.test(lower) || /গতকাল/.test(complaint)) {
    hint.dayOffset = -1;
  } else if (/\btoday\b/.test(lower) || /আজ/.test(complaint)) {
    hint.dayOffset = 0;
  }

  if (hint.hour === undefined && hint.dayOffset === undefined) {
    return null;
  }

  return hint;
};

export const counterpartyMatchesPhone = (
  counterparty: string,
  phone: string,
): boolean => {
  const normalizedCounterparty = normalizePhone(counterparty);
  const normalizedPhone = normalizePhone(phone);

  return (
    normalizedCounterparty === normalizedPhone ||
    normalizedCounterparty.endsWith(normalizedPhone) ||
    normalizedPhone.endsWith(normalizedCounterparty)
  );
};
