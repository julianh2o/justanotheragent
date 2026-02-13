# Contact Directory

Personal contact management with iMessage integration. Track relationships, set contact frequencies, and sync message history.

## Features

- **Contact Management**: Store contacts with multiple channels (phone, email, address, social)
- **iMessage Sync**: Automatically sync message history from macOS Messages app
- **Contact Frequency**: Set outreach frequency per contact, track overdue contacts
- **Tags & Custom Fields**: Organize contacts with tags and extensible custom fields
- **REST API**: Full API access for external integrations

## Quick Start

```bash
# Install dependencies
yarn install

# Set up environment
cp .env.example .env

# Run development servers
yarn dev
```

Frontend: http://localhost:2998
Backend: http://localhost:2999

## Commands

```bash
yarn dev              # Run frontend + backend
yarn build            # Build frontend
yarn build:server     # Compile server TypeScript
yarn start            # Run production server
yarn test             # Run all tests
yarn lint             # Run ESLint
yarn typecheck        # TypeScript type checking
```

## iMessage Sync

Requires the `messages_sync_helper` macOS menu bar app. See [messages_sync_helper/README.md](messages_sync_helper/README.md).

The helper connects via WebSocket to sync new messages and can send messages via AppleScript.

## Environment Variables

```bash
PORT=2999                    # Server port (default: 2999)
DATABASE_URL="file:./data/db.db"  # SQLite database path
```

## API Endpoints

### Contacts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contacts` | List all contacts |
| GET | `/api/contacts/:id` | Get contact by ID |
| POST | `/api/contacts` | Create contact |
| PUT | `/api/contacts/:id` | Update contact |
| DELETE | `/api/contacts/:id` | Delete contact |
| DELETE | `/api/contacts` | Purge all contacts |
| POST | `/api/contacts/:id/mark-contacted` | Mark contact as contacted today |
| POST | `/api/contacts/sync-last-contacted` | Sync last contacted dates from iMessage |

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/:phoneNumber` | Get messages for phone number |
| POST | `/api/messages/send` | Send iMessage via helper |
| POST | `/api/messages/purge-all` | Delete all stored messages |

### Lookups

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lookups/channel-types` | List channel types |
| GET | `/api/lookups/custom-fields` | List custom field definitions |
| GET | `/api/lookups/tags` | List all tags |
| POST | `/api/lookups/tags` | Create new tag |

### Attachments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attachments/:filename` | Serve attachment file |

### CSV Import/Export

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contacts/csv` | Export contacts as CSV |
| POST | `/api/contacts/csv` | Import contacts from CSV |

## Docker

```bash
# Build image
docker build -t contact-directory .

# Run container
docker run -p 2999:2999 -v ./data:/app/data contact-directory
```
