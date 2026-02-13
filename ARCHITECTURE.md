# Architecture

## Overview

Contact directory application with React/TypeScript frontend, Express backend, and iMessage sync via a macOS helper app.

## Stack

**Frontend**: React 19, TypeScript, Material-UI v7, React Router v7

**Backend**: Express 5, TypeScript, Prisma ORM v7, SQLite

**iMessage Sync**: Python menu bar app using rumps, websockets

## Directory Structure

```
├── src/                    # Frontend source
│   ├── components/         # Reusable UI components
│   ├── pages/              # Route-based page components
│   ├── contexts/           # React context providers
│   ├── utils/              # Utilities
│   └── styles/             # Theme and styling
├── server/                 # Backend source
│   ├── api/                # API route handlers
│   ├── services/           # Business logic
│   └── websocket.ts        # WebSocket for message sync
├── prisma/                 # Database schema and migrations
├── messages_sync_helper/   # macOS iMessage sync app
│   └── src/                # Python source
├── data/                   # Runtime data
│   ├── db.db               # SQLite database
│   └── attachments/        # Synced message attachments
└── build/                  # Production build output
```

## Database Schema

### Core Tables

**Contact**: Primary entity with name, birthday, notes, outreach frequency, last contacted date.

**Channel**: Contact method (phone, email, address, social). Links to Contact. Supports structured address fields.

**Tag** / **TagOnContact**: Many-to-many tagging system.

**CustomFieldDefinition** / **CustomFieldValue**: Extensible custom fields per contact.

**ChannelType**: Lookup table for channel types (phone, email, address, etc.).

### Message Sync Tables

**StoredMessage**: Synced iMessage data with rowid, guid, text, handle, timestamps.

**StoredAttachment**: Attachments from messages with local file path.

**SyncState**: Tracks last synced message rowid for incremental sync.

## API Routes

All routes prefixed with `/api`.

| Router | Path | Purpose |
|--------|------|---------|
| contacts | `/contacts` | CRUD for contacts, sync last contacted |
| contacts-csv | `/contacts/csv` | CSV import/export |
| lookups | `/lookups` | Channel types, custom fields, tags |
| messages | `/messages` | Fetch/send messages, purge |
| attachments | `/attachments` | Serve attachment files |

## WebSocket Protocol

The server accepts WebSocket connections at `/messages-sync`.

**From helper to server**:
```json
{
  "type": "new_messages",
  "messages": [...],
  "timestamp": "2025-01-20T12:00:00"
}
```

**From server to helper**:
```json
{
  "type": "send_message",
  "handle_id": "+1234567890",
  "text": "Hello!"
}
```

## Environment Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 2999 | Server port |
| DATABASE_URL | file:./data/db.db | SQLite database path |

## Development vs Production

**Development**: Frontend (port 2998) and backend (port 2999) run separately with CORS enabled.

**Production**: Backend serves static frontend from `/build/public`. Single origin.

## Key Files

- `server/index.ts` - Express server setup and WebSocket initialization
- `server/websocket.ts` - WebSocket handling for message sync
- `server/services/messageStorage.ts` - Message persistence logic
- `prisma/schema.prisma` - Database schema
- `messages_sync_helper/src/main.py` - macOS menu bar app entry point
