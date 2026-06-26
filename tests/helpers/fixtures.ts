import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { TicketAnalysisRequest } from '../../src/types/ticket.types.js';
import type { StructuredExpectation } from './sample-assertions.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '../..');

export interface PublicSampleCase {
  id: string;
  input: TicketAnalysisRequest;
  expected_output: StructuredExpectation & {
    ticket_id: string;
    agent_summary?: string;
    customer_reply?: string;
    recommended_next_action?: string;
    confidence?: number;
    reason_codes?: string[];
  };
}

export interface HiddenCase {
  id: string;
  input: TicketAnalysisRequest;
  assertions: {
    structured?: StructuredExpectation;
    unsafe_patterns_absent?: string[];
    bangla_reply?: boolean;
  };
}

export const loadPublicSamples = (): PublicSampleCase[] => {
  const path = join(repoRoot, 'docs/preli-problem-statement/SUST_Preli_Sample_Cases.json');
  const pack = JSON.parse(readFileSync(path, 'utf8')) as { cases: PublicSampleCase[] };
  return pack.cases;
};

export const loadHiddenCases = (): HiddenCase[] => {
  const path = join(repoRoot, 'tests/fixtures/hidden-cases.json');
  const pack = JSON.parse(readFileSync(path, 'utf8')) as { cases: HiddenCase[] };
  return pack.cases;
};
