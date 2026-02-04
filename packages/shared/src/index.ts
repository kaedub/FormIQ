export type QuestionType = 'multi_select' | 'single_select' | 'free_text';

export interface QuestionResponseInput {
  questionId: string;
  answer: string[];
}

export interface IntakeRequest {
  email: string;
  title: string;
  responses: QuestionResponseInput[];
}

export interface CreateStoryInput {
  userId: string;
  title: string;
  responses: QuestionResponseInput[];
}

export type StoryStatus = 'draft' | 'generating' | 'ready';

export type ChapterStatus = 'locked' | 'unlocked' | 'completed';

export type TaskStatus = 'locked' | 'unlocked' | 'completed';

export interface IntakeQuestionDto {
  id: string;
  prompt: string;
  options: string[];
  questionType: QuestionType;
  position: number;
}

export interface IntakeFormDto {
  id: string;
  name: string;
  questions: IntakeQuestionDto[];
}

export interface IntakeFormQuestions {
  name: string;
  questions: IntakeQuestionDto[];
}

export interface QuestionAnswerDto {
  questionId: string;
  storyId: string;
  answer: string[];
  answeredAt: string;
}

export interface QuestionResponseDto {
  question: IntakeQuestionDto;
  answer: QuestionAnswerDto;
}

export interface ChapterDto {
  id: string;
  storyId: string;
  title: string;
  summary: string;
  context?: unknown;
  position: number;
  status: ChapterStatus;
  generatedAt?: string;
  metadata?: unknown;
}

export interface TaskDto {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  position: number;
  status: TaskStatus;
  generatedAt?: string;
  completedAt?: string;
  metadata?: unknown;
}

export interface StoryDto {
  id: string;
  userId: string;
  title: string;
  status: StoryStatus;
  generatedAt?: string;
  createdAt: string;
  updatedAt: string;
  responses: QuestionResponseDto[];
}

export interface StorySummaryDto {
  id: string;
  title: string;
  status?: StoryStatus;
}

export type PromptExecutionStage =
  | 'story_context'
  | 'chapter_outline'
  | 'chapter_validation'
  | 'task_generation'
  | 'task_validation';

export type PromptExecutionStatus = 'pending' | 'success' | 'failed';

export interface PromptExecutionDto {
  id: string;
  storyId: string;
  chapterId?: string;
  taskId?: string;
  templateId?: string;
  stage: PromptExecutionStage;
  status: PromptExecutionStatus;
  input: unknown;
  output?: unknown;
  model?: string;
  metadata?: unknown;
  createdAt: string;
}

export type StoryEventType =
  | 'status_change'
  | 'chapter_generated'
  | 'task_generated'
  | 'task_completed';

export interface StoryEventDto {
  id: string;
  storyId: string;
  eventType: StoryEventType;
  payload?: unknown;
  createdAt: string;
}

export interface StoryContextDto {
  story: StoryDto;
  chapters: ChapterDto[];
  tasks: TaskDto[];
  promptExecutions: PromptExecutionDto[];
  events: StoryEventDto[];
}

export interface StoryResponse {
  id: string;
  title: string;
  status: StoryStatus;
  responses: QuestionResponseDto[];
}
