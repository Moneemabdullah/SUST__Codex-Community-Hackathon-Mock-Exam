import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { analyzeStructured } from '../../src/services/ticket/ticket-rules.engine.js';
import type { TicketAnalysisRequest } from '../../src/types/ticket.types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const samplePath = join(
  __dirname,
  '../../docs/preli-problem-statement/SUST_Preli_Sample_Cases.json',
);

interface SampleCase {
  id: string;
  input: TicketAnalysisRequest;
  expected_output: {
    relevant_transaction_id: string | null;
    evidence_verdict: string;
    case_type: string;
    severity: string;
    department: string;
    human_review_required: boolean;
  };
}

const samplePack = JSON.parse(readFileSync(samplePath, 'utf8')) as {
  cases: SampleCase[];
};

const STRUCTURED_FIELDS = [
  'relevant_transaction_id',
  'evidence_verdict',
  'case_type',
  'severity',
  'department',
  'human_review_required',
] as const;

describe('ticket-rules.engine', () => {
  it.each(samplePack.cases.map((sample) => [sample.id, sample] as const))(
    '%s structured fields match expected output',
    (_id, sample) => {
      const result = analyzeStructured(sample.input);

      for (const field of STRUCTURED_FIELDS) {
        expect(result[field], `${sample.id}.${field}`).toBe(sample.expected_output[field]);
      }
    },
  );

  it('runs without network or LLM dependencies', () => {
    const started = performance.now();
    for (const sample of samplePack.cases) {
      analyzeStructured(sample.input);
    }
    const elapsed = performance.now() - started;
    expect(elapsed).toBeLessThan(50 * samplePack.cases.length);
  });
});
