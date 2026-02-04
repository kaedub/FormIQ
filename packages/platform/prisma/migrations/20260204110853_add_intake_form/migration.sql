/*
  Warnings:

  - Added the required column `formId` to the `IntakeQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `QuestionAnswer` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "QuestionAnswer_storyId_questionId_key";

-- AlterTable
ALTER TABLE "IntakeQuestion" ADD COLUMN     "formId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "QuestionAnswer" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "IntakeForm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "IntakeForm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IntakeForm_name_key" ON "IntakeForm"("name");

-- AddForeignKey
ALTER TABLE "IntakeQuestion" ADD CONSTRAINT "IntakeQuestion_formId_fkey" FOREIGN KEY ("formId") REFERENCES "IntakeForm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
