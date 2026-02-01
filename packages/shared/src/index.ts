export type QuestionType = 'multi_select' | 'single_select' | 'free_text';

export interface QuestionResponseInput {
  question: string;
  answer?: string;
  options?: string[];
  questionType: QuestionType;
}

export interface IntakeRequest {
  email: string;
  title: string;
  responses: QuestionResponseInput[];
}

export type StoryStatus = 'draft' | 'generating' | 'ready';

export type TaskStatus = 'locked' | 'unlocked' | 'completed';

export interface QuestionResponse extends QuestionResponseInput {
  id: string;
  storyId: string;
}

export interface StoryResponse {
  id: string;
  title: string;
  status: StoryStatus;
  responses: QuestionResponse[];
}
