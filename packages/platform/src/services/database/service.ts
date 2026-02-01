import type { PrismaClient } from '@prisma/client';
import type {
  DatabaseService,
  DatabaseServiceDependencies,
} from './types.js';
import type {
  CreateStoryInput,
  StoryContextDto,
  StoryDto,
  StorySummaryDto,
} from '@formiq/shared';
import type {  
  StoryWithContext,
  StoryWithResponses,
} from './mappers.js';
import {
  mapChapterDto,
  mapPromptExecutionDto,
  mapStoryDto,
  mapStoryEventDto,
  mapTaskDto,
} from './mappers.js';

class PrismaDatabaseService implements DatabaseService {
  constructor(private readonly db: PrismaClient) {}

  async createStory(
    input: CreateStoryInput,
  ): Promise<StoryDto> {
    const story = (await this.db.story.create({
      data: {
        userId: input.userId,
        title: input.title,
        questionAnswers: {
          create: input.responses.map((response) => ({
            question: {
              connect: { id: response.questionId },
            },
            answer: response.answer,
          })),
        },
      },
      include: {
        questionAnswers: {
          include: {
            question: true,
          },
          orderBy: {
            question: {
              position: 'asc',
            },
          },
        },
      },
    })) as StoryWithResponses;

    return mapStoryDto(story);
  }

  async getStoryById(
    storyId: string,
    userId: string,
  ): Promise<StoryDto | null> {
    const story = (await this.db.story.findFirst({
      where: {
        id: storyId,
        userId,
      },
      include: {
        questionAnswers: {
          include: {
            question: true,
          },
          orderBy: {
            question: {
              position: 'asc',
            },
          },
        },
      },
    })) as StoryWithResponses | null;

    return story ? mapStoryDto(story) : null;
  }

  async getStoryContext(
    storyId: string,
    userId: string,
  ): Promise<StoryContextDto> {
    const story = (await this.db.story.findFirst({
      where: {
        id: storyId,
        userId,
      },
      include: {
        questionAnswers: {
          include: {
            question: true,
          },
          orderBy: {
            question: {
              position: 'asc',
            },
          },
        },
        chapters: {
          include: {
            tasks: true,
          },
        },
        promptExecutions: true,
        events: true,
      },
    })) as StoryWithContext | null;

    if (!story) {
      throw new Error(`Story ${storyId} not found for user ${userId}`);
    }

    return {
      story: mapStoryDto(story as StoryWithResponses),
      chapters: story.chapters.map(mapChapterDto),
      tasks: story.chapters.flatMap((chapter) =>
        chapter.tasks.map(mapTaskDto),
      ),
      promptExecutions: story.promptExecutions.map(mapPromptExecutionDto),
      events: story.events.map(mapStoryEventDto),
    };
  }

  async getStoriesByUserId(userId: string): Promise<StorySummaryDto[]> {
    const stories = await this.db.story.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });

    if (stories.length === 0) {
      throw new Error(`No stories found for user ${userId}`);
    }

    return stories.map((story) => ({
      id: story.id,
      title: story.title,
      status: story.status,
    }));
  }
}

export const createDatabaseService = ({ db }: DatabaseServiceDependencies): DatabaseService => {
  return new PrismaDatabaseService(db);
};
