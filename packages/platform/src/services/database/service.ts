import type { DatabaseService, DatabaseServiceDependencies, getStoriesByUserIdResponse } from './types.js';

class PrismaDatabaseService implements DatabaseService {
  constructor(private readonly deps: DatabaseServiceDependencies) {
    // Future database operations will use deps.prisma
  }

  async getStoriesByUserId(userId: string): Promise<getStoriesByUserIdResponse> {
    // Example implementation - replace with actual Prisma query
    return this.deps.prisma.story.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
      }
    });
  }
}

export const createDatabaseService = (deps: DatabaseServiceDependencies): DatabaseService => {
  return new PrismaDatabaseService(deps);
};
