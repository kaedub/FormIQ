import type OpenAI from 'openai';
import type { IntakeQuestionDto, StoryDto } from '@formiq/shared';

export type AIServiceDependencies = {
  client: OpenAI;
};

export interface ChapterOutlineMilestone {
  title: string;
  description: string;
  successCriteria: string[];
  estimatedDurationDays?: number;
}

export interface ChapterOutlineItem {
  title: string;
  summary: string;
  position: number;
  milestones: ChapterOutlineMilestone[];
}

export interface ChapterOutline {
  chapters: ChapterOutlineItem[];
}

export interface AIService {
  generateForm(): Promise<IntakeQuestionDto[]>;
  generateChapterOutline(story: StoryDto): Promise<ChapterOutline>;
}
