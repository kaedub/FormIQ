import type { ProjectDto } from '@formiq/shared';
import { z } from 'zod';
import {
  coarseTaskScheduleContextSchema,
  projectContextSchema,
  projectPlanSchema,
} from './schemas.js';

export interface PromptContext<ContextJson> {
  toJSON(): ContextJson;
}

export type ProjectContextJson = z.infer<typeof projectContextSchema>;

export type ProjectOutlineJson = z.infer<typeof projectPlanSchema>;

export type CoarseTaskScheduleContextJson = z.infer<
  typeof coarseTaskScheduleContextSchema
>;

export class ProjectContext implements PromptContext<ProjectContextJson> {
  constructor(private readonly project: ProjectDto) {}

  toJSON(): ProjectContextJson {
    return {
      project: {
        title: this.project.title,
        responses: this.project.responses.map((entry) => ({
          question: [
            entry.question.prompt,
            entry.question.questionType !== 'free_text' &&
            entry.question.options.length > 0
              ? `Options: ${entry.question.options.join(', ')}`
              : null,
          ]
            .filter((part): part is string => Boolean(part))
            .join(' '),
          answers: entry.answer.values,
        })),
      },
    };
  }
}

export class CoarseTaskScheduleContext implements PromptContext<CoarseTaskScheduleContextJson> {
  constructor(
    private readonly projectContext: ProjectContext,
    private readonly projectOutline: ProjectOutlineJson,
  ) {}

  toJSON(): CoarseTaskScheduleContextJson {
    return {
      projectContext: this.projectContext.toJSON(),
      projectOutline: this.projectOutline,
    };
  }
}
