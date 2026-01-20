-- AlterTable
ALTER TABLE "MessageProcessingBatch" ADD COLUMN "errorMessage" TEXT;
ALTER TABLE "MessageProcessingBatch" ADD COLUMN "llmPrompt" TEXT;
ALTER TABLE "MessageProcessingBatch" ADD COLUMN "llmResponse" TEXT;
