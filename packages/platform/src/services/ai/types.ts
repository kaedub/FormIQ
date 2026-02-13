import type OpenAI from 'openai';
import { z } from 'zod';
import type { MilestoneDto, ProjectDto } from '@formiq/shared';
import {
  intakeFormSchema,
  projectPlanMilestoneSchema,
  projectPlanSchema,
  taskScheduleSchema,
  taskSchema,
} from './schemas.js';

export type AIServiceDependencies = {
  client: OpenAI;
};

export type IntakeFormDefintion = z.infer<typeof intakeFormSchema>;

export type ProjectOutlineMilestone = z.infer<
  typeof projectPlanMilestoneSchema
>;

export type ProjectOutline = z.infer<typeof projectPlanSchema>;

export type GeneratedTask = z.infer<typeof taskSchema>;

export type TaskSchedule = z.infer<typeof taskScheduleSchema>;

export interface CoarseTaskScheduleGenerationContext {
  project: ProjectDto;
  outline: ProjectOutline;
}

export interface TaskGenerationContext {
  project: ProjectDto;
  milestone: MilestoneDto;
}

export interface AIService {
  generateForm(): Promise<IntakeFormDefintion>;
  generateProjectOutline(project: ProjectDto): Promise<ProjectOutline>;
  generateCoarseTaskSchedule(
    input: CoarseTaskScheduleGenerationContext,
  ): Promise<TaskSchedule>;
  // generateTasksForMilestone(input: TaskGenerationContext): Promise<TaskSchedule>;
}
