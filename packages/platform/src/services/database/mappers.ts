import type {
  FocusForm as FocusFormModel,
  Milestone as MilestoneModel,
  Project as ProjectModel,
  Task as TaskModel,
} from '@prisma/client';
import type {
  FormRecordDto,
  MilestoneDto,
  ProjectDto,
  TaskDto,
} from '@formiq/shared';

export type ProjectWithResponses = ProjectModel;

export const mapProjectDto = (project: ProjectWithResponses): ProjectDto => {
  const dto: ProjectDto = {
    id: project.id,
    userId: project.userId,
    title: project.title,
    status: project.status,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    responses: [],
  };
  if (project.generatedAt) {
    dto.generatedAt = project.generatedAt.toISOString();
  }
  return dto;
};

export const mapMilestoneDto = (milestone: MilestoneModel): MilestoneDto => {
  const dto: MilestoneDto = {
    id: milestone.id,
    projectId: milestone.projectId,
    title: milestone.title,
    summary: milestone.summary,
    context: milestone.context ?? undefined,
    position: milestone.position,
    status: milestone.status,
    metadata: milestone.metadata ?? undefined,
  };
  if (milestone.generatedAt) {
    dto.generatedAt = milestone.generatedAt.toISOString();
  }
  return dto;
};

export const mapTaskDto = (task: TaskModel): TaskDto => {
  const dto: TaskDto = {
    id: task.id,
    milestoneId: task.milestoneId,
    title: task.title,
    description: task.description,
    position: task.position,
    status: task.status,
    metadata: task.metadata ?? undefined,
  };
  if (task.generatedAt) {
    dto.generatedAt = task.generatedAt.toISOString();
  }
  if (task.completedAt) {
    dto.completedAt = task.completedAt.toISOString();
  }
  return dto;
};

export const mapFormRecordDto = (form: FocusFormModel): FormRecordDto => ({
  id: form.id,
  name: form.name,
  projectId: form.projectId,
  kind: 'focus_questions',
});
