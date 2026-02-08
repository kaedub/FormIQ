import type { IntakeQuestionDto, QuestionType } from '@formiq/shared';
import type {
  ChapterOutline,
  ChapterOutlineItem,
  ChapterOutlineMilestone,
} from './types.js';

const FORM_QUESTION_TYPES: readonly QuestionType[] = [
  'free_text',
  'single_select',
  'multi_select',
];

const isRecord = (
  value: unknown,
): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

const isQuestionType = (value: unknown): value is QuestionType => {
  return FORM_QUESTION_TYPES.includes(value as QuestionType);
};

const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
};

const isFiniteNumber = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isFinite(value);
};

const normalizeFormQuestion = (
  question: unknown,
  index: number,
): IntakeQuestionDto => {
  if (!isRecord(question)) {
    throw new Error(`Form question at index ${index} is not an object`);
  }

  const { id, prompt, questionType, options, position } = question;

  if (!isNonEmptyString(id)) {
    throw new Error(`Form question at index ${index} is missing an id`);
  }

  if (!isNonEmptyString(prompt)) {
    throw new Error(`Form question at index ${index} is missing a prompt`);
  }

  if (!isQuestionType(questionType)) {
    throw new Error(`Form question at index ${index} has an invalid questionType`);
  }

  if (!isStringArray(options)) {
    throw new Error(`Form question at index ${index} has invalid options`);
  }

  const normalizedPosition = Number.isFinite(position)
    ? Number(position)
    : index;

  return {
    id,
    prompt,
    questionType,
    options: questionType === 'free_text' ? [] : options,
    position: normalizedPosition,
  };
};

export const parseFormDefinition = (
  content: string | null,
): IntakeQuestionDto[] => {
  if (!content) {
    throw new Error('OpenAI returned an empty form response');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new Error('Unable to parse OpenAI form JSON');
  }

  if (!isRecord(parsed)) {
    throw new Error('Form payload must be an object');
  }

  const questions = parsed['questions'];

  if (!Array.isArray(questions)) {
    throw new Error('Form payload is missing questions array');
  }

  return questions.map((question, index) => normalizeFormQuestion(question, index));
};

const normalizeMilestone = (
  milestone: unknown,
  chapterIndex: number,
  milestoneIndex: number,
): ChapterOutlineMilestone => {
  if (!isRecord(milestone)) {
    throw new Error(`Milestone at index ${milestoneIndex} for chapter ${chapterIndex} is not an object`);
  }

  const { title, description, successCriteria, estimatedDurationDays } = milestone;

  if (!isNonEmptyString(title)) {
    throw new Error(`Milestone at index ${milestoneIndex} for chapter ${chapterIndex} is missing a title`);
  }

  if (!isNonEmptyString(description)) {
    throw new Error(`Milestone at index ${milestoneIndex} for chapter ${chapterIndex} is missing a description`);
  }

  if (estimatedDurationDays !== undefined && !isFiniteNumber(estimatedDurationDays)) {
    throw new Error(`Milestone at index ${milestoneIndex} for chapter ${chapterIndex} has invalid estimatedDurationDays`);
  }

  const normalizedSuccessCriteria = successCriteria && isStringArray(successCriteria)
    ? successCriteria
    : [];

  return {
    title,
    description,
    successCriteria: normalizedSuccessCriteria,
    ...(estimatedDurationDays !== undefined ? { estimatedDurationDays } : {}),
  };
};

const normalizeChapter = (
  chapter: unknown,
  index: number,
): ChapterOutlineItem => {
  if (!isRecord(chapter)) {
    throw new Error(`Chapter at index ${index} is not an object`);
  }

  const { title, summary, position, milestones } = chapter;

  if (!isNonEmptyString(title)) {
    throw new Error(`Chapter at index ${index} is missing a title`);
  }

  if (!isNonEmptyString(summary)) {
    throw new Error(`Chapter at index ${index} is missing a summary`);
  }

  const normalizedPosition = Number.isFinite(position)
    ? Number(position)
    : index;

  if (!Array.isArray(milestones)) {
    throw new Error(`Chapter at index ${index} has invalid milestones`);
  }

  const normalizedMilestones = milestones.map((item, milestoneIndex) =>
    normalizeMilestone(item, index, milestoneIndex),
  );

  return {
    title,
    summary,
    position: normalizedPosition,
    milestones: normalizedMilestones,
  };
};

export const parseChapterOutline = (
  content: string | null,
): ChapterOutline => {
  if (!content) {
    throw new Error('OpenAI returned an empty chapter outline response');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new Error('Unable to parse OpenAI chapter outline JSON');
  }

  if (!isRecord(parsed)) {
    throw new Error('Chapter outline payload must be an object');
  }

  const chapters = parsed['chapters'];

  if (!Array.isArray(chapters)) {
    throw new Error('Chapter outline payload is missing chapters array');
  }

  return {
    chapters: chapters.map((chapter, index) => normalizeChapter(chapter, index)),
  };
};
