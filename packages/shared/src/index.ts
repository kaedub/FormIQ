export type QuestionType = 'multi' | 'select' | 'text';

export interface IntakeDetailInput {
  question: string;
  answer?: string;
  options?: string[];
  questionType: QuestionType;
}

export interface IntakeRequest {
  email: string;
  title: string;
  details: IntakeDetailInput[];
}

export type StoryStatus = 'draft' | 'processing' | 'active';

export type StepStatus = 'locked' | 'unlocked' | 'completed';

export interface DetailResponse extends IntakeDetailInput {
  id: string;
  storyId: string;
}

export interface StoryResponse {
  id: string;
  title: string;
  status: StoryStatus;
  details: DetailResponse[];
}
