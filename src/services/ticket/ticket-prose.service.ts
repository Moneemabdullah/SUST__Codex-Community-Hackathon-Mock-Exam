import { AI_PROVIDER } from '../../constants/ai.constants.js';
import { isAIConfigured } from '../../config/ai.config.js';
import type { ILLMProvider } from '../../interfaces/ai/ILLMProvider.js';
import { ANALYZE_TICKET_PROSE_PROMPTS } from '../../prompts/manifest.js';
import { buildAnalyzeTicketProseUserPrompt } from '../../prompts/analyze-ticket-prose.user.js';
import type { TicketAnalysisRequest } from '../../types/ticket.types.js';
import { buildProseTemplates, type ProseFields } from './prose-templates.js';
import type { StructuredAnalysis } from './rules/types.js';

export type { ProseFields } from './prose-templates.js';

const PROSE_RESPONSE_SHAPE = `{
  "agent_summary": "string",
  "recommended_next_action": "string",
  "customer_reply": "string"
}`;

export const stripMarkdownFences = (content: string): string => {
  const trimmed = content.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced?.[1]?.trim() ?? trimmed;
};

export const parseProseFields = (content: string): ProseFields | null => {
  try {
    const parsed = JSON.parse(stripMarkdownFences(content)) as Partial<ProseFields>;
    if (
      typeof parsed.agent_summary === 'string' &&
      parsed.agent_summary.trim() &&
      typeof parsed.recommended_next_action === 'string' &&
      parsed.recommended_next_action.trim() &&
      typeof parsed.customer_reply === 'string' &&
      parsed.customer_reply.trim()
    ) {
      return {
        agent_summary: parsed.agent_summary.trim(),
        recommended_next_action: parsed.recommended_next_action.trim(),
        customer_reply: parsed.customer_reply.trim(),
      };
    }
    return null;
  } catch {
    return null;
  }
};

const shouldUseProvider = (provider: ILLMProvider): boolean =>
  provider.name !== AI_PROVIDER.NOOP && isAIConfigured();

const callProvider = async (
  request: TicketAnalysisRequest,
  structured: StructuredAnalysis,
  provider: ILLMProvider,
): Promise<ProseFields | null> => {
  const result = await provider.complete({
    messages: [
      { role: 'system', content: ANALYZE_TICKET_PROSE_PROMPTS.system },
      { role: 'user', content: buildAnalyzeTicketProseUserPrompt(request, structured) },
    ],
    temperature: 0.2,
    maxTokens: 800,
    responseShape: PROSE_RESPONSE_SHAPE,
  });

  if (!result.ok) {
    return null;
  }

  return parseProseFields(result.value.content);
};

export const generateProse = async (
  request: TicketAnalysisRequest,
  structured: StructuredAnalysis,
  provider: ILLMProvider,
): Promise<ProseFields> => {
  const fallback = () => buildProseTemplates(request, structured);

  if (!shouldUseProvider(provider)) {
    return fallback();
  }

  const firstAttempt = await callProvider(request, structured, provider);
  if (firstAttempt) {
    return firstAttempt;
  }

  const secondAttempt = await callProvider(request, structured, provider);
  if (secondAttempt) {
    return secondAttempt;
  }

  return fallback();
};
