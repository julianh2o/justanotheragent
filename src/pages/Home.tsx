import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, Typography, Paper } from '@mui/material';

import { APP_TITLE, PAGE_TITLE_HOME } from '../utils/constants';
import { Contact, ChannelType, CustomFieldDefinition, Tag } from '../types';
import { fetchContacts, fetchChannelTypes, fetchCustomFieldDefinitions, fetchTags } from '../utils/contactsApi';
import ContactListSidebar from '../components/ContactListSidebar';
import ContactDetailView from '../components/ContactDetailView';
import ContactDialog from '../components/ContactDialog';

export const Home = () => {
	const [contacts, setContacts] = useState<Contact[]>([]);
	const [channelTypes, setChannelTypes] = useState<ChannelType[]>([]);
	const [customFieldDefs, setCustomFieldDefs] = useState<CustomFieldDefinition[]>([]);
	const [tags, setTags] = useState<Tag[]>([]);
	const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [loading, setLoading] = useState(true);

	const loadData = useCallback(async () => {
		try {
			setLoading(true);
			const [contactsData, channelTypesData, customFieldsData, tagsData] = await Promise.all([
				fetchContacts(),
				fetchChannelTypes(),
				fetchCustomFieldDefinitions(),
				fetchTags(),
			]);
			setContacts(contactsData);
			setChannelTypes(channelTypesData);
			setCustomFieldDefs(customFieldsData);
			setTags(tagsData);

			// Update selected contact if it exists
			if (selectedContact) {
				const updated = contactsData.find((c) => c.id === selectedContact.id);
				setSelectedContact(updated || null);
			}
		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			setLoading(false);
		}
	}, [selectedContact]);

	useEffect(() => {
		loadData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleSelectContact = (contact: Contact) => {
		setSelectedContact(contact);
	};

	const handleAddContact = () => {
		setDialogOpen(true);
	};

	const handleDialogClose = () => {
		setDialogOpen(false);
	};

	const handleDialogSave = () => {
		setDialogOpen(false);
		loadData();
	};

	const handleContactUpdate = () => {
		loadData();
	};

	return (
		<>
			<Helmet>
				<title>
					{PAGE_TITLE_HOME} | {APP_TITLE}
				</title>
			</Helmet>
			<Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
				{/* Left sidebar - Contact list */}
				<Box sx={{ width: 350, flexShrink: 0 }}>
					<ContactListSidebar
						contacts={contacts}
						selectedContactId={selectedContact?.id || null}
						onSelectContact={handleSelectContact}
						onAddContact={handleAddContact}
					/>
				</Box>

				{/* Right panel - Contact detail */}
				<Box sx={{ flex: 1, overflow: 'hidden' }}>
					{loading && contacts.length === 0 ? (
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
							<Typography color='text.secondary'>Loading...</Typography>
						</Box>
					) : selectedContact ? (
						<ContactDetailView
							contact={selectedContact}
							channelTypes={channelTypes}
							customFieldDefs={customFieldDefs}
							tags={tags}
							onContactUpdate={handleContactUpdate}
							onTagsChange={setTags}
						/>
					) : (
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
							<Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
								<Typography variant='h6' gutterBottom>
									Select a contact
								</Typography>
								<Typography variant='body2' color='text.secondary'>
									Choose a contact from the list to view their details, or click the + button to add a new contact.
								</Typography>
							</Paper>
						</Box>
					)}
				</Box>
			</Box>

			<ContactDialog
				open={dialogOpen}
				contact={null}
				channelTypes={channelTypes}
				customFieldDefs={customFieldDefs}
				tags={tags}
				onClose={handleDialogClose}
				onSave={handleDialogSave}
				onTagsChange={setTags}
			/>
		</>
	);
};
