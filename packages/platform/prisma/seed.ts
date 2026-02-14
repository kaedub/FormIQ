import { getPrismaClient } from '../src/clients/prisma.js';
import { TEST_USER_ID } from '@formiq/shared';

const prisma = getPrismaClient();

const testUser = {
  id: TEST_USER_ID,
  email: 'test-user@example.com',
  password: 'test',
};

const main = async (): Promise<void> => {
  console.log('Seeding test user:', testUser.email);
  await prisma.user.upsert({
    where: { email: testUser.email },
    update: {},
    create: testUser,
  });
};

void main()
  .catch((error: unknown) => {
    console.error('Seeding intake form failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
