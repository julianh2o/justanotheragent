-- CreateTable
CREATE TABLE "MessageProcessingBatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contactId" TEXT NOT NULL,
    "messageHashes" TEXT NOT NULL,
    "conversationSnippet" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MessageProcessingBatch_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SuggestedUpdate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batchId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "suggestedChanges" TEXT NOT NULL,
    "hasNotableUpdates" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "acceptedChanges" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SuggestedUpdate_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "MessageProcessingBatch" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SuggestedUpdate_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProcessedMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageHash" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProcessedMessage_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "MessageProcessingBatch" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedMessage_messageHash_key" ON "ProcessedMessage"("messageHash");
