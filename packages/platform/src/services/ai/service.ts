import type OpenAI from 'openai';
import type { IntakeQuestionDto } from '@formiq/shared';
import type { AIService, AIServiceDependencies } from './types.js';
import { parseFormDefinition } from './utils.js';

const DEFAULT_MODEL = 'gpt-4o-mini';

const SYSTEM_PROMPT = `
You are FormIQ's intake form generator.
Return a concise JSON object with this exact shape:
{"questions":[{"id":"...", "prompt":"...", "questionType":"free_text|single_select|multi_select", "options":["..."], "position":0}]}
- Use snake_case IDs.
- Keep 4-6 questions tailored for onboarding a user who wants a goal-to-roadmap plan.
- For free_text questions, return an empty options array.
- Positions must start at 0 and increment by 1 in order.
- Respond with JSON only, no additional text.
`.trim();

class OpenAIAIService implements AIService {
  constructor(private readonly client: OpenAI) {}

  async generateForm(): Promise<IntakeQuestionDto[]> {
    const completion = await this.client.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: 'Generate an intake form JSON payload.',
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content ?? null;

    return parseFormDefinition(content);
  }
}

export const createAIService = ({
  client,
}: AIServiceDependencies): AIService => {
  return new OpenAIAIService(client);
};
