import { z } from 'zod';

const questionTypeSchema = z.enum([
  'free_text',
  'single_select',
  'multi_select',
]);

export const formQuestionSchema = z
  .object({
    id: z.string().min(1),
    prompt: z.string().min(1),
    questionType: questionTypeSchema,
    options: z.array(z.string()),
    position: z.number().int().nonnegative(),
  })
  .strict();

export const formDefinitionSchema = z
  .object({
    questions: z.array(formQuestionSchema),
  })
  .strict();

export const projectContextSchema = z
  .object({
    project: z
      .object({
        title: z.string().min(1),
        responses: z.array(
          z
            .object({
              question: z.string().min(1),
              answers: z.array(z.string()),
            })
            .strict(),
        ),
      })
      .strict(),
  })
  .strict();

export const projectMilestoneSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
  })
  .strict();

export const projectPlanSchema = z
  .object({
    milestones: z.array(projectMilestoneSchema),
  })
  .strict();

export const taskSchema = z
  .object({
    day: z.number().int().positive(),
    title: z.string().min(1),
    objective: z.string().min(1),
    body: z.string().min(1),
    estimatedMinutes: z.number().positive(),
  })
  .strict();

export const milestoneTasksSchema = z
  .object({
    tasks: z.array(taskSchema),
  })
  .strict();

export const milestoneContextSchema = z
  .object({
    title: z.string().min(1),
    summary: z.string().min(1),
  })
  .strict();

export const milestoneTaskContextSchema = z
  .object({
    projectContext: projectContextSchema,
    milestone: milestoneContextSchema,
  })
  .strict();

// export const FORM_DEFINITION_JSON_SCHEMA: JsonSchema = toJsonSchema(intakeFormSchema, 'intake_form');

// export const PROJECT_CONTEXT_JSON_SCHEMA: JsonSchema = toJsonSchema(
//   projectContextSchema,
//   'project_context',
// );

// export const PROJECT_PLAN_JSON_SCHEMA: JsonSchema = toJsonSchema(projectPlanSchema, 'project_plan');

// export const TASK_SCHEDULE_JSON_SCHEMA: JsonSchema = toJsonSchema(taskScheduleSchema, 'task_schedule');
