# TASKS.md - Documentation & Deployment Agent

**Branch**: `refactor/docs-deployment`
**Status**: ACTIVE

## Instructions

Check this file periodically. If you see "STOP WORKING" below, stop immediately.

---

## Tasks

### 1. Update README.md

- [ ] Remove all mentions of Discord integration
- [ ] Remove all mentions of Tmux adapter
- [ ] Remove all mentions of Ollama/BAML/LLM analysis
- [ ] Remove Admin page documentation
- [ ] Document core features clearly:
  - iMessage sync and sending
  - Contact directory with channels, tags, custom fields
  - REST APIs for external access
- [ ] Update installation instructions (remove BAML setup)
- [ ] Update environment variables section (remove Discord/Tmux/LLM vars)
- [ ] Document new API endpoints (overdue, filtering)

### 2. Update ARCHITECTURE.md

- [ ] Remove Discord bot section
- [ ] Remove Tmux adapter section
- [ ] Remove LLM/BAML analysis section
- [ ] Remove message processing pipeline documentation
- [ ] Update database schema documentation (remove processing tables)
- [ ] Update API endpoint list
- [ ] Simplify architecture descriptions
- [ ] Update any diagrams if present

### 3. Create docker-compose.yml

- [ ] Create `docker-compose.yml` for dev environment
- [ ] Include:
  - App service with volume mounts for development
  - Proper port mapping (2999)
  - Environment variables from .env
- [ ] Test with `docker-compose up`

### 4. Verify Dockerfile

- [ ] Review existing Dockerfile
- [ ] Ensure it still works after dependency removal
- [ ] Remove any BAML build steps if present
- [ ] Test: `docker build -t justanotheragent .`
- [ ] Test: `docker run -p 2999:2999 justanotheragent`

### 5. Verify Mac App (messages_sync_helper)

- [ ] Check that Python helper app still works
- [ ] Update README in that directory if needed
- [ ] Verify no references to removed features

### 6. Verification Checklist

- [ ] README accurately reflects current features
- [ ] ARCHITECTURE.md is up to date
- [ ] No mentions of removed features in docs
- [ ] Docker build succeeds
- [ ] Docker container runs and serves app
- [ ] docker-compose.yml works for dev environment
- [ ] messages_sync_helper functions correctly

## Documentation Style Guide

- Be concise - engineers scan, don't read novels
- Include examples over prose
- Front-load critical info
- Delete verbose explanations

**COMMIT** after each major documentation update.
