import type { PrismaClient } from '@prisma/client';
import type {
  CreateMilestoneTasksInput,
  CreateProjectInput,
  CreateProjectMilestonesInput,
  FormRecordDto,
  CreateFormRecordInput,
  ReplaceFocusFormItemsInput,
  FormDefinition,
  ProjectContextDto,
  ProjectDto,
  ProjectSummaryDto,
  GetProjectInput,
} from '@formiq/shared';

export type DatabaseServiceDependencies = {
  db: PrismaClient;
};

export interface DatabaseService {
  getProject(input: GetProjectInput): Promise<ProjectDto | null>;
  getProjectDetails(input: GetProjectInput): Promise<ProjectContextDto>;
  getProjectsByUserId(userId: string): Promise<ProjectSummaryDto[]>;
  getFocusFormByName(name: string): Promise<FormRecordDto | null>;
  createFocusForm(input: CreateFormRecordInput): Promise<FormRecordDto>;
  replaceFocusFormItems(input: ReplaceFocusFormItemsInput): Promise<void>;
  createProject(input: CreateProjectInput): Promise<ProjectDto>;
  createProjectMilestones(input: CreateProjectMilestonesInput): Promise<void>;
  createMilestoneTasks(input: CreateMilestoneTasksInput): Promise<void>;
}
