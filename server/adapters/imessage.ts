import Database from 'better-sqlite3';
import path from 'path';

export interface Message {
	userId: string;
	message: string;
	date: string;
	service: string;
	destinationCallerId: string;
	isFromMe: boolean;
}

const IMESSAGE_DB_PATH = path.join(process.cwd(), 'iMessage-Data.sqlite');

let db: Database.Database | null = null;

function getDb(): Database.Database {
	if (!db) {
		try {
			db = new Database(IMESSAGE_DB_PATH, { readonly: true });
		} catch (error) {
			throw new Error(`Failed to open iMessage database: ${error}`);
		}
	}
	return db;
}

function normalizePhoneNumber(phone: string): string {
	// Remove all non-digit characters except leading +
	const hasPlus = phone.startsWith('+');
	const digits = phone.replace(/\D/g, '');
	return hasPlus ? `+${digits}` : digits;
}

export function getMessagesByPhoneNumber(phoneNumber: string, limit = 50): Message[] {
	const database = getDb();
	const normalized = normalizePhoneNumber(phoneNumber);

	// Try matching with and without + prefix
	const variants = [normalized];
	if (!normalized.startsWith('+')) {
		variants.push(`+${normalized}`);
		variants.push(`+1${normalized}`); // US country code
	}

	const placeholders = variants.map(() => '?').join(', ');
	const stmt = database.prepare(`
		SELECT
			user_id as userId,
			message,
			date,
			service,
			destination_caller_id as destinationCallerId,
			is_from_me as isFromMe
		FROM Messages
		WHERE user_id IN (${placeholders})
		ORDER BY date DESC
		LIMIT ?
	`);

	const rows = stmt.all(...variants, limit) as Array<{
		userId: string;
		message: string;
		date: string;
		service: string;
		destinationCallerId: string;
		isFromMe: string;
	}>;

	return rows.map((row) => ({
		...row,
		isFromMe: row.isFromMe === '1',
	}));
}

export function closeDb(): void {
	if (db) {
		db.close();
		db = null;
	}
}
