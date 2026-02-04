import type OpenAI from 'openai';
import type { IntakeQuestionDto } from '@formiq/shared';

export type AIServiceDependencies = {
  client: OpenAI;
};

export interface AIService {
  generateForm(): Promise<IntakeQuestionDto[]>;
}
