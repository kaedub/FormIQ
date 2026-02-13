import type {
  IntakeForm as IntakeFormModel,
  IntakeQuestion as IntakeQuestionModel,
  Milestone as MilestoneModel,
  Project as ProjectModel,
  ProjectEvent as ProjectEventModel,
  PromptExecution as PromptExecutionModel,
  QuestionAnswer as QuestionAnswerModel,
  Task as TaskModel,
} from '@prisma/client';
import type {
  IntakeQuestionDto,
  IntakeFormDto,
  MilestoneDto,
  PromptExecutionDto,
  ProjectDto,
  ProjectEventDto,
  QuestionAnswerDto,
  QuestionResponseDto,
  TaskDto,
} from '@formiq/shared';

export type QuestionAnswerWithQuestion = QuestionAnswerModel & {
  question: IntakeQuestionModel;
};

export type ProjectWithResponses = ProjectModel & {
  questionAnswers: QuestionAnswerWithQuestion[];
};

export type ProjectWithContext = ProjectWithResponses & {
  milestones: (MilestoneModel & { tasks: TaskModel[] })[];
  promptExecutions: PromptExecutionModel[];
  events: ProjectEventModel[];
};

export type IntakeFormWithQuestions = IntakeFormModel & {
  questions: IntakeQuestionModel[];
};

export const mapIntakeQuestionDto = (
  question: IntakeQuestionModel,
): IntakeQuestionDto => ({
  id: question.id,
  prompt: question.prompt,
  options: question.options,
  questionType: question.questionType,
  position: question.position,
});

export const mapQuestionAnswerDto = (
  answer: QuestionAnswerModel,
): QuestionAnswerDto => ({
  questionId: answer.questionId,
  projectId: answer.projectId,
  values: answer.values,
  answeredAt: answer.answeredAt.toISOString(),
});

export const mapQuestionResponseDto = (
  entry: QuestionAnswerWithQuestion,
): QuestionResponseDto => ({
  question: mapIntakeQuestionDto(entry.question),
  answer: mapQuestionAnswerDto(entry),
});

export const mapProjectDto = (project: ProjectWithResponses): ProjectDto => {
  const dto: ProjectDto = {
    id: project.id,
    userId: project.userId,
    title: project.title,
    status: project.status,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    responses: project.questionAnswers.map(mapQuestionResponseDto),
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

export const mapPromptExecutionDto = (
  exec: PromptExecutionModel,
): PromptExecutionDto => {
  const dto: PromptExecutionDto = {
    id: exec.id,
    projectId: exec.projectId,
    stage: exec.stage,
    status: exec.status,
    input: exec.input,
    createdAt: exec.createdAt.toISOString(),
  };

  if (exec.milestoneId) {
    dto.milestoneId = exec.milestoneId;
  }
  if (exec.taskId) {
    dto.taskId = exec.taskId;
  }
  if (exec.templateId) {
    dto.templateId = exec.templateId;
  }
  if (exec.output !== null) {
    dto.output = exec.output;
  }
  if (exec.model) {
    dto.model = exec.model;
  }
  if (exec.metadata != null) {
    dto.metadata = exec.metadata;
  }

  return dto;
};

export const mapProjectEventDto = (
  event: ProjectEventModel,
): ProjectEventDto => ({
  id: event.id,
  projectId: event.projectId,
  eventType: event.eventType,
  payload: event.payload ?? undefined,
  createdAt: event.createdAt.toISOString(),
});

export const mapIntakeFormDto = (
  form: IntakeFormWithQuestions,
): IntakeFormDto => ({
  id: form.id,
  name: form.name,
  questions: form.questions.map(mapIntakeQuestionDto),
});
