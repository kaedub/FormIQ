import type { IntakeQuestionDto, QuestionType } from '@formiq/shared';

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
