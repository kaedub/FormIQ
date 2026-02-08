import type OpenAI from 'openai';
import type { IntakeQuestionDto, StoryDto } from '@formiq/shared';
import type {
  AIService,
  AIServiceDependencies,
  ChapterOutline,
} from './types.js';
import { parseChapterOutline, parseFormDefinition } from './utils.js';

const DEFAULT_MODEL = 'gpt-4o-mini';

const SYSTEM_PROMPT = `
You are FormIQ's intake form generator.
Return a concise JSON object with this exact shape:
{"questions":[{"id":"...", "prompt":"...", "questionType":"free_text|single_select|multi_select", "options":["..."], "position":0}]}
- Use snake_case IDs.
- Keep 4-6 questions tailored for onboarding a user who wants a goal-to-roadmap plan.
- For free_text questions, return an empty options array.
- Positions must start at 0 and increment by 1 in order.
- Respond with JSON only, no additional text.
`.trim();

const STORY_CONTEXT_JSON_SCHEMA = {
  type: 'object',
  required: ['story'],
  properties: {
    story: {
      type: 'object',
      required: ['title', 'responses'],
      properties: {
        title: { type: 'string' },
        responses: {
          type: 'array',
          items: {
            type: 'object',
            required: ['question', 'answers'],
            properties: {
              question: { type: 'string' },
              answers: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
  },
};

const CHAPTER_OUTLINE_JSON_SCHEMA = {
  type: 'object',
  required: ['chapters'],
  properties: {
    chapters: {
      type: 'array',
      items: {
        type: 'object',
        required: ['title', 'summary', 'position', 'milestones'],
        properties: {
          title: { type: 'string' },
          summary: { type: 'string' },
          position: { type: 'number' },
          milestones: {
            type: 'array',
            items: {
              type: 'object',
              required: ['title', 'description'],
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                successCriteria: { type: 'array', items: { type: 'string' } },
                estimatedDurationDays: { type: 'number' },
              },
            },
          },
        },
      },
    },
  },
};

const CHAPTER_OUTLINE_PROMPT = `
You are FormIQ's roadmap planner. Generate a concise chapter outline with milestones based on the provided story context.
- Always conform to the CHAPTER_OUTLINE_JSON_SCHEMA.
- Use the STORY_CONTEXT_JSON_SCHEMA as the contract for how story data is provided.
- Derive 3-6 chapters that progress the user from start to finish. Keep titles action-oriented and summaries brief (one or two sentences).
- Each chapter must include 2-4 milestones with specific, outcome-focused descriptions. Add successCriteria when helpful; include estimatedDurationDays when confident.
- Keep language clear, directive, and free of filler. Do not restate questions; synthesize answers into actionable steps.
- Respond with JSON only, no additional text.
`.trim();

const buildStoryContextPayload = (story: StoryDto) => ({
  story: {
    title: story.title,
    responses: story.responses.map((entry) => ({
      question: [
        entry.question.prompt,
        entry.question.questionType !== 'free_text'
          ? `Options: ${entry.question.options.join(', ')}`
          : null,
      ]
        .filter(Boolean)
        .join(' '),
      answers: entry.answer.values,
    })),
  },
});

class OpenAIAIService implements AIService {
  constructor(private readonly client: OpenAI) {}

  async generateForm(): Promise<IntakeQuestionDto[]> {
    const completion = await this.client.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: 'Generate an intake form JSON payload.',
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content ?? null;

    return parseFormDefinition(content);
  }

  async generateChapterOutline(story: StoryDto): Promise<ChapterOutline> {
    const storyContextPayload = buildStoryContextPayload(story);
    const completion = await this.client.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: CHAPTER_OUTLINE_PROMPT,
        },
        {
          role: 'user',
          content: [
            `STORY_CONTEXT_JSON_SCHEMA: ${JSON.stringify(STORY_CONTEXT_JSON_SCHEMA, null, 2)}`,
            `CHAPTER_OUTLINE_JSON_SCHEMA: ${JSON.stringify(CHAPTER_OUTLINE_JSON_SCHEMA, null, 2)}`,
            'STORY_CONTEXT_JSON:',
            JSON.stringify(storyContextPayload, null, 2),
          ].join('\n'),
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content ?? null;

    return parseChapterOutline(content);
  }
}

export const createAIService = ({
  client,
}: AIServiceDependencies): AIService => {
  return new OpenAIAIService(client);
};
