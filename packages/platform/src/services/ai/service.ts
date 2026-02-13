import type OpenAI from 'openai';
import type { ProjectDto } from '@formiq/shared';
import {
  CoarseTaskScheduleGenerationRequest,
  IntakeFormDefinitionRequest,
  ProjectOutlineGenerationRequest,
} from './generation-requests.js';
import { CoarseTaskScheduleContext, ProjectContext } from './contexts.js';
import type {
  AIService,
  AIServiceDependencies,
  CoarseTaskScheduleGenerationContext,
  IntakeFormDefintion,
  ProjectOutline,
  TaskSchedule,
} from './types.js';

class OpenAIService implements AIService {
  constructor(private readonly client: OpenAI) {}

  async generateForm(): Promise<IntakeFormDefintion> {
    const request = new IntakeFormDefinitionRequest(this.client);
    const response = await request.execute();
    return response;
  }

  async generateProjectOutline(project: ProjectDto): Promise<ProjectOutline> {
    const projectContext = new ProjectContext(project);
    const request = new ProjectOutlineGenerationRequest(
      this.client,
      projectContext,
    );
    const projectOutline = await request.execute();
    // TODO: validate response
    return projectOutline;
  }

  async generateCoarseTaskSchedule(
    input: CoarseTaskScheduleGenerationContext,
  ): Promise<TaskSchedule> {
    const projectContext = new ProjectContext(input.project);
    const coarseContext = new CoarseTaskScheduleContext(
      projectContext,
      input.outline,
    );
    const request = new CoarseTaskScheduleGenerationRequest(
      this.client,
      coarseContext,
    );
    const taskSchedule = await request.execute();
    // TODO: validate response
    return taskSchedule;
  }
}

export const createAIService = ({
  client,
}: AIServiceDependencies): AIService => {
  return new OpenAIService(client);
};
