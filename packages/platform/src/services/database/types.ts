import type { PrismaClient } from '@prisma/client';

export type RequestContext = {
  userId?: string;
  storyId?: string;
  correlationId?: string;
};

export type DatabaseServiceDependencies = {
  prisma: PrismaClient;
};

export type getStoriesByUserIdResponse = { id: string; title: string }[];

export interface DatabaseService {
  getStoriesByUserId (userId: string): Promise<getStoriesByUserIdResponse>;
}
