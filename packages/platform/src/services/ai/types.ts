import type OpenAI from 'openai';
import type {
  IntakeQuestionDto,
  MilestoneDto,
  ProjectDto,
} from '@formiq/shared';

export type AIServiceDependencies = {
  client: OpenAI;
};

export interface ProjectPlanMilestone {
  title: string;
  description: string;
  successCriteria: string[];
  estimatedDurationDays?: number;
}

export interface ProjectPlan {
  milestones: ProjectPlanMilestone[];
}

export interface GeneratedTask {
  day: number;
  title: string;
  objective: string;
  description: string;
  body: string;
  estimatedMinutes: number;
  optionalChallenge?: string;
  reflectionPrompt?: string;
}

export interface TaskSchedule {
  tasks: GeneratedTask[];
}

export interface TaskGenerationContext {
  project: ProjectDto;
  milestone: MilestoneDto;
}

export interface AIService {
  generateForm(): Promise<IntakeQuestionDto[]>;
  generateProjectPlan(project: ProjectDto): Promise<ProjectPlan>;
  generateTasksForMilestone(input: TaskGenerationContext): Promise<TaskSchedule>;
}
