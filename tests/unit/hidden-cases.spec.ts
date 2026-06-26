import { describe, expect, it } from 'vitest';

import { NoopProvider } from '../../src/services/ai/providers/noop.provider.js';
import { TicketAnalyzerService } from '../../src/services/ticket/ticket-analyzer.service.js';
import { validateResponse } from '../../src/validators/response.validator.js';
import { loadHiddenCases } from '../helpers/fixtures.js';
import {
  assertBanglaReply,
  assertSafeProse,
  assertStructuredFields,
  assertUnsafePatternsAbsent,
} from '../helpers/sample-assertions.js';

const hiddenCases = loadHiddenCases();

describe('hidden adversarial cases', () => {
  const service = new TicketAnalyzerService(new NoopProvider());

  it('loads at least 25 hidden cases', () => {
    expect(hiddenCases.length).toBeGreaterThanOrEqual(25);
  });

  it.each(hiddenCases.map((entry) => [entry.id, entry] as const))(
    '%s passes structured and safety assertions',
    async (_id, testCase) => {
      const result = await service.analyze(testCase.input);

      expect(result.ok).toBe(true);
      if (!result.ok) {
        return;
      }

      if (testCase.assertions.structured) {
        assertStructuredFields(result.value, testCase.assertions.structured);
      }

      assertSafeProse(result.value.customer_reply, result.value.recommended_next_action);

      if (testCase.assertions.unsafe_patterns_absent) {
        assertUnsafePatternsAbsent(
          `${result.value.customer_reply} ${result.value.recommended_next_action}`,
          testCase.assertions.unsafe_patterns_absent,
        );
      }

      if (testCase.assertions.bangla_reply) {
        assertBanglaReply(result.value.customer_reply);
      }

      expect(validateResponse(result.value).valid).toBe(true);
    },
  );
});
