import type { PrismaClient } from '@prisma/client';
import type {
  CreateStoryInput,
  StoryContextDto,
  StoryDto,
  StorySummaryDto,
} from '@formiq/shared';

export type DatabaseServiceDependencies = {
  db: PrismaClient;
};

export interface DatabaseService {
  createStory(input: CreateStoryInput): Promise<StoryDto>;
  getStoryById(storyId: string, userId: string): Promise<StoryDto | null>;
  getStoryContext(storyId: string, userId: string): Promise<StoryContextDto>;
  getStoriesByUserId(userId: string): Promise<StorySummaryDto[]>;
}
