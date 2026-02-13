# TASKS.md - Database Cleanup Agent

**Branch**: `refactor/database-cleanup`
**Status**: ACTIVE

## Instructions

Check this file periodically. If you see "STOP WORKING" below, stop immediately.

---

## Tasks

### 1. Modify prisma/schema.prisma

#### Remove Enums (do first)
- [ ] Remove `BatchStatus` enum (lines 95-100)
- [ ] Remove `SuggestionStatus` enum (lines 102-107)

#### Remove Models
- [ ] Remove `MessageProcessingBatch` model (lines 109-124)
- [ ] Remove `SuggestedUpdate` model (lines 126-138)
- [ ] Remove `ProcessedMessage` model (lines 140-146)

#### Clean Contact Model References
- [ ] Remove `processingBatches MessageProcessingBatch[]` from Contact model (line 26)
- [ ] Remove `suggestedUpdates SuggestedUpdate[]` from Contact model (line 27)

### 2. Create Migration
- [ ] Run `yarn prisma:migrate` with descriptive name like "remove_llm_processing_tables"
- [ ] Verify migration file is created
- [ ] Review migration SQL to ensure it only drops the intended tables

### 3. Generate Prisma Client
- [ ] Run `yarn prisma:generate`
- [ ] Verify no errors in client generation

### 4. Verification
- [ ] Migration applies cleanly
- [ ] Prisma client generates without errors
- [ ] Grep check: no references to removed tables in codebase
  - `grep -r "MessageProcessingBatch" --include="*.ts" --include="*.tsx"`
  - `grep -r "SuggestedUpdate" --include="*.ts" --include="*.tsx"`
  - `grep -r "ProcessedMessage" --include="*.ts" --include="*.tsx"`

## Critical Notes

**MODELS TO KEEP**:
- Contact
- Channel
- Tag
- CustomField
- Message

**COMMIT** after migration is created and verified.
