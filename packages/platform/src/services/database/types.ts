import type { PrismaClient } from '@prisma/client';
import type {
  CreateProjectInput,
  IntakeFormDto,
  IntakeFormQuestions,
  ProjectContextDto,
  ProjectDto,
  ProjectSummaryDto,
} from '@formiq/shared';

export type DatabaseServiceDependencies = {
  db: PrismaClient;
};

export interface DatabaseService {
  createProject(input: CreateProjectInput): Promise<ProjectDto>;
  getProjectById(projectId: string, userId: string): Promise<ProjectDto | null>;
  getProjectContext(projectId: string, userId: string): Promise<ProjectContextDto>;
  getProjectsByUserId(userId: string): Promise<ProjectSummaryDto[]>;
  createIntakeForm(
    intakeForm: IntakeFormQuestions,
  ): Promise<IntakeFormDto>;
  getIntakeFormByName(name: string): Promise<IntakeFormDto | null>;
}
