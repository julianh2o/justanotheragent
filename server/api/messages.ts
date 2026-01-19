import { Router, Request, Response } from 'express';
import { getMessagesByPhoneNumber } from '../adapters/imessage';

const router = Router();

// GET /api/messages/:phoneNumber - Get messages for a phone number
router.get('/:phoneNumber', (req: Request, res: Response) => {
	const { phoneNumber } = req.params;
	const limit = parseInt(req.query.limit as string) || 50;

	try {
		const messages = getMessagesByPhoneNumber(phoneNumber, limit);
		res.json(messages);
	} catch (error) {
		console.error('Error fetching messages:', error);
		res.status(500).json({ error: 'Failed to fetch messages' });
	}
});

export default router;
