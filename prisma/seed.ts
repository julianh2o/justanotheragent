import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
	url: process.env.DATABASE_URL || 'file:./data/db.db',
});

const prisma = new PrismaClient({ adapter });

const channelTypes = [
	{ id: 'phone', name: 'Phone' },
	{ id: 'email', name: 'Email' },
	{ id: 'address', name: 'Address' },
	{ id: 'discord', name: 'Discord' },
	{ id: 'instagram', name: 'Instagram' },
	{ id: 'facebook_messenger', name: 'Facebook Messenger' },
];

const customFieldDefinitions = [
	{ id: 'love_language', name: 'Love Language' },
	{ id: 'difficult_love_languages', name: 'Difficult Love Languages' },
	{ id: 'music', name: 'Music' },
	{ id: 'colors', name: 'Colors' },
	{ id: 'gift_ideas', name: 'Gift Ideas' },
	{ id: 'gifts', name: 'Gifts' },
	{ id: 'jewelry', name: 'Jewelry' },
	{ id: 'work_schedule', name: 'Work Schedule' },
	{ id: 'sick_food', name: 'Sick Food' },
	{ id: 'movies_tv', name: 'Movies/TV' },
	{ id: 'food_entree', name: 'Food: Entree' },
	{ id: 'misc', name: 'Misc' },
	{ id: 'animals', name: 'Animals' },
	{ id: 'flower', name: 'Flower' },
	{ id: 'beverage', name: 'Beverage' },
	{ id: 'alcohol', name: 'Alcohol' },
	{ id: 'height', name: 'Height' },
	{ id: 'sizing', name: 'Sizing' },
	{ id: 'ring', name: 'Ring' },
	{ id: 'sweets', name: 'Sweets' },
	{ id: 'sex', name: 'Sex' },
	{ id: 'fetish', name: 'Fetish' },
	{ id: 'nice_things', name: 'Nice Things' },
	{ id: 'compliments', name: 'Compliments' },
	{ id: 'ask', name: 'Ask' },
	{ id: 'home_town', name: 'Home Town' },
];

async function main() {
	console.log('Seeding channel types...');

	for (let i = 0; i < channelTypes.length; i++) {
		const channelType = channelTypes[i];
		await prisma.channelType.upsert({
			where: { id: channelType.id },
			update: { name: channelType.name, sortOrder: i },
			create: { id: channelType.id, name: channelType.name, sortOrder: i },
		});
	}

	console.log(`Seeded ${channelTypes.length} channel types.`);

	console.log('Seeding custom field definitions...');

	for (let i = 0; i < customFieldDefinitions.length; i++) {
		const field = customFieldDefinitions[i];
		await prisma.customFieldDefinition.upsert({
			where: { id: field.id },
			update: { name: field.name, sortOrder: i },
			create: { id: field.id, name: field.name, sortOrder: i },
		});
	}

	console.log(`Seeded ${customFieldDefinitions.length} custom field definitions.`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
