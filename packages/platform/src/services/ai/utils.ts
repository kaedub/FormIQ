import type { IntakeQuestionDto } from '@formiq/shared';
import { z } from 'zod';
import type { GeneratedTask, ProjectPlan, ProjectPlanMilestone, TaskSchedule } from './types.js';

const questionTypeSchema = z.enum(['free_text', 'single_select', 'multi_select']);

const intakeQuestionSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
  questionType: questionTypeSchema,
  options: z.array(z.string()),
  position: z.number().int().nonnegative(),
});

const intakeFormSchema = z.object({
  questions: z.array(intakeQuestionSchema),
});

const projectPlanMilestoneSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  successCriteria: z.array(z.string()).default([]),
  estimatedDurationDays: z.number().nonnegative().optional(),
});

const projectPlanSchema = z.object({
  milestones: z.array(projectPlanMilestoneSchema),
});

const taskSchema = z.object({
  day: z.number().int().positive(),
  title: z.string().min(1),
  objective: z.string().min(1),
  description: z.string().min(1),
  body: z.string().min(1),
  estimatedMinutes: z.number().positive(),
  optionalChallenge: z.string().min(1).optional(),
  reflectionPrompt: z.string().min(1).optional(),
});

const taskScheduleSchema = z.object({
  tasks: z.array(taskSchema),
});

const formatIssues = (issues: z.ZodIssue[]): string => {
  return issues
    .map((issue) => {
      const path = issue.path.join('.') || '<root>';
      return `${path}: ${issue.message}`;
    })
    .join('; ');
};

const parseJsonContent = (content: string | null, context: string): unknown => {
  if (!content) {
    throw new Error(`OpenAI returned an empty ${context} response`);
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown parse error';
    throw new Error(`Unable to parse OpenAI ${context} JSON: ${message}`);
  }
};

const parseWithSchema = <T>(
  schema: z.ZodType<T>,
  content: string | null,
  context: string,
): T => {
  const parsed = parseJsonContent(content, context);
  const validationResult = schema.safeParse(parsed);

  if (!validationResult.success) {
    throw new Error(`${context} payload failed validation: ${formatIssues(validationResult.error.issues)}`);
  }

  return validationResult.data;
};

export const parseFormDefinition = (
  content: string | null,
): IntakeQuestionDto[] => {
  const parsed = parseWithSchema(intakeFormSchema, content, 'form');

  return parsed.questions.map((question) => ({
    id: question.id,
    prompt: question.prompt,
    questionType: question.questionType,
    options: question.options,
    position: question.position,
  }));
};

export const parseProjectPlan = (
  content: string | null,
): ProjectPlan => {
  const parsed = parseWithSchema(projectPlanSchema, content, 'project plan');

  return {
    milestones: parsed.milestones.map(
      (milestone): ProjectPlanMilestone => ({
        title: milestone.title,
        description: milestone.description,
        successCriteria: milestone.successCriteria ?? [],
        ...(milestone.estimatedDurationDays !== undefined
          ? { estimatedDurationDays: milestone.estimatedDurationDays }
          : {}),
      }),
    ),
  };
};

export const parseTaskSchedule = (
  content: string | null,
): TaskSchedule => {
  const parsed = parseWithSchema(taskScheduleSchema, content, 'task schedule');

  return {
    tasks: parsed.tasks.map(
      (task): GeneratedTask => ({
        day: task.day,
        title: task.title,
        objective: task.objective,
        description: task.description,
        body: task.body,
        estimatedMinutes: task.estimatedMinutes,
        ...(task.optionalChallenge ? { optionalChallenge: task.optionalChallenge } : {}),
        ...(task.reflectionPrompt ? { reflectionPrompt: task.reflectionPrompt } : {}),
      }),
    ),
  };
};
