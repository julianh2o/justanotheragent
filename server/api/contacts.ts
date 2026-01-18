import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

// GET /api/contacts - List all contacts
router.get('/', async (_req: Request, res: Response) => {
	try {
		const contacts = await prisma.contact.findMany({
			include: {
				channels: true,
				tags: {
					include: {
						tag: true,
					},
				},
				customFields: {
					include: {
						field: true,
					},
				},
			},
			orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
		});
		res.json(contacts);
	} catch (error) {
		console.error('Error fetching contacts:', error);
		res.status(500).json({ error: 'Failed to fetch contacts' });
	}
});

// GET /api/contacts/:id - Get single contact
router.get('/:id', async (req: Request, res: Response) => {
	try {
		const contact = await prisma.contact.findUnique({
			where: { id: req.params.id },
			include: {
				channels: true,
				tags: {
					include: {
						tag: true,
					},
				},
				customFields: {
					include: {
						field: true,
					},
				},
			},
		});
		if (!contact) {
			res.status(404).json({ error: 'Contact not found' });
			return;
		}
		res.json(contact);
	} catch (error) {
		console.error('Error fetching contact:', error);
		res.status(500).json({ error: 'Failed to fetch contact' });
	}
});

// POST /api/contacts - Create new contact
router.post('/', async (req: Request, res: Response) => {
	try {
		const {
			firstName,
			lastName,
			birthday,
			notes,
			outreachFrequencyDays,
			preferredContactMethod,
			channels,
			tagIds,
			customFields,
		} = req.body;

		const contact = await prisma.contact.create({
			data: {
				firstName,
				lastName,
				birthday: birthday ? new Date(birthday) : null,
				notes,
				outreachFrequencyDays,
				preferredContactMethod,
				channels: channels
					? {
							create: channels.map(
								(ch: {
									type: string;
									identifier: string;
									label?: string;
									isPrimary?: boolean;
									street1?: string;
									street2?: string;
									city?: string;
									state?: string;
									zip?: string;
									country?: string;
								}) => ({
									type: ch.type,
									identifier: ch.identifier,
									label: ch.label,
									isPrimary: ch.isPrimary ?? false,
									street1: ch.street1,
									street2: ch.street2,
									city: ch.city,
									state: ch.state,
									zip: ch.zip,
									country: ch.country,
								}),
							),
						}
					: undefined,
				tags: tagIds
					? {
							create: tagIds.map((tagId: string) => ({
								tag: { connect: { id: tagId } },
							})),
						}
					: undefined,
				customFields: customFields
					? {
							create: customFields.map((cf: { fieldId: string; value: string }) => ({
								fieldId: cf.fieldId,
								value: cf.value,
							})),
						}
					: undefined,
			},
			include: {
				channels: true,
				tags: {
					include: {
						tag: true,
					},
				},
				customFields: {
					include: {
						field: true,
					},
				},
			},
		});

		res.status(201).json(contact);
	} catch (error) {
		console.error('Error creating contact:', error);
		res.status(500).json({ error: 'Failed to create contact' });
	}
});

// PUT /api/contacts/:id - Update contact
router.put('/:id', async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const {
			firstName,
			lastName,
			birthday,
			notes,
			outreachFrequencyDays,
			preferredContactMethod,
			channels,
			tagIds,
			customFields,
		} = req.body;

		// Delete existing related records and recreate them
		await prisma.$transaction(async (tx) => {
			// Delete existing channels, tags, and custom fields
			await tx.channel.deleteMany({ where: { contactId: id } });
			await tx.tagOnContact.deleteMany({ where: { contactId: id } });
			await tx.customFieldValue.deleteMany({ where: { contactId: id } });

			// Update contact with new data
			await tx.contact.update({
				where: { id },
				data: {
					firstName,
					lastName,
					birthday: birthday ? new Date(birthday) : null,
					notes,
					outreachFrequencyDays,
					preferredContactMethod,
					channels: channels
						? {
								create: channels.map(
									(ch: {
										type: string;
										identifier: string;
										label?: string;
										isPrimary?: boolean;
										street1?: string;
										street2?: string;
										city?: string;
										state?: string;
										zip?: string;
										country?: string;
									}) => ({
										type: ch.type,
										identifier: ch.identifier,
										label: ch.label,
										isPrimary: ch.isPrimary ?? false,
										street1: ch.street1,
										street2: ch.street2,
										city: ch.city,
										state: ch.state,
										zip: ch.zip,
										country: ch.country,
									}),
								),
							}
						: undefined,
					tags: tagIds
						? {
								create: tagIds.map((tagId: string) => ({
									tag: { connect: { id: tagId } },
								})),
							}
						: undefined,
					customFields: customFields
						? {
								create: customFields.map((cf: { fieldId: string; value: string }) => ({
									fieldId: cf.fieldId,
									value: cf.value,
								})),
							}
						: undefined,
				},
			});
		});

		// Fetch updated contact
		const contact = await prisma.contact.findUnique({
			where: { id },
			include: {
				channels: true,
				tags: {
					include: {
						tag: true,
					},
				},
				customFields: {
					include: {
						field: true,
					},
				},
			},
		});

		res.json(contact);
	} catch (error) {
		console.error('Error updating contact:', error);
		res.status(500).json({ error: 'Failed to update contact' });
	}
});

// DELETE /api/contacts/:id - Delete contact
router.delete('/:id', async (req: Request, res: Response) => {
	try {
		await prisma.contact.delete({
			where: { id: req.params.id },
		});
		res.status(204).send();
	} catch (error) {
		console.error('Error deleting contact:', error);
		res.status(500).json({ error: 'Failed to delete contact' });
	}
});

export default router;
