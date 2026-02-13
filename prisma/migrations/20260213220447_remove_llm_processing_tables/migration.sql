/*
  Warnings:

  - You are about to drop the `MessageProcessingBatch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProcessedMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SuggestedUpdate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MessageProcessingBatch";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ProcessedMessage";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SuggestedUpdate";
PRAGMA foreign_keys=on;
