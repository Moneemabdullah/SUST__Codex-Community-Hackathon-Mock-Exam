import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { analyzeStructured } from '../../src/services/ticket/ticket-rules.engine.js';
import { loadPublicSamples } from '../helpers/fixtures.js';
import { assertStructuredFields } from '../helpers/sample-assertions.js';

const sampleCases = loadPublicSamples();

describe('ticket-rules.engine', () => {
  it.each(sampleCases.map((sample) => [sample.id, sample] as const))(
    '%s structured fields match expected output',
    (_id, sample) => {
      const result = analyzeStructured(sample.input);
      assertStructuredFields(result, sample.expected_output);
    },
  );

  it('runs without network or LLM dependencies', () => {
    const started = performance.now();
    for (const sample of sampleCases) {
      analyzeStructured(sample.input);
    }
    const elapsed = performance.now() - started;
    expect(elapsed).toBeLessThan(50 * sampleCases.length);
  });
});
