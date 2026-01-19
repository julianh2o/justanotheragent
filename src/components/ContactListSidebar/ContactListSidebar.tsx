import React, { useState, useMemo } from 'react';
import {
	Box,
	TextField,
	List,
	ListItemButton,
	ListItemText,
	ListItemAvatar,
	Avatar,
	Typography,
	InputAdornment,
	IconButton,
	Menu,
	MenuItem,
	ListItemIcon,
} from '@mui/material';
import {
	Search as SearchIcon,
	Add as AddIcon,
	MoreVert as MoreIcon,
	FileDownload as ExportIcon,
	FileUpload as ImportIcon,
	Description as TemplateIcon,
	Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { Contact } from '../../types';

interface ContactListSidebarProps {
	contacts: Contact[];
	selectedContactId: string | null;
	onSelectContact: (contact: Contact) => void;
	onAddContact: () => void;
	onImport: () => void;
	onExport: () => void;
	onDownloadTemplate: () => void;
	onSendReminder: () => void;
}

export default function ContactListSidebar({
	contacts,
	selectedContactId,
	onSelectContact,
	onAddContact,
	onImport,
	onExport,
	onDownloadTemplate,
	onSendReminder,
}: ContactListSidebarProps) {
	const [searchQuery, setSearchQuery] = useState('');
	const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

	const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setMenuAnchor(event.currentTarget);
	};

	const handleMenuClose = () => {
		setMenuAnchor(null);
	};

	const handleImportClick = () => {
		handleMenuClose();
		onImport();
	};

	const handleExportClick = () => {
		handleMenuClose();
		onExport();
	};

	const handleTemplateClick = () => {
		handleMenuClose();
		onDownloadTemplate();
	};

	const handleSendReminderClick = () => {
		handleMenuClose();
		onSendReminder();
	};

	const filteredContacts = useMemo(() => {
		if (!searchQuery.trim()) return contacts;
		const query = searchQuery.toLowerCase();
		return contacts.filter((contact) => {
			const fullName = `${contact.firstName} ${contact.lastName || ''}`.toLowerCase();
			const email = contact.channels.find((c) => c.type === 'email')?.identifier?.toLowerCase() || '';
			const phone = contact.channels.find((c) => c.type === 'phone')?.identifier || '';
			const tags = contact.tags.map((t) => t.tag.name.toLowerCase()).join(' ');
			return fullName.includes(query) || email.includes(query) || phone.includes(query) || tags.includes(query);
		});
	}, [contacts, searchQuery]);

	const getInitials = (contact: Contact): string => {
		const first = contact.firstName?.[0] || '';
		const last = contact.lastName?.[0] || '';
		return (first + last).toUpperCase() || '?';
	};

	const getSubtitle = (contact: Contact): string => {
		const email = contact.channels.find((c) => c.type === 'email')?.identifier;
		const phone = contact.channels.find((c) => c.type === 'phone')?.identifier;
		return email || phone || '';
	};

	return (
		<Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRight: 1, borderColor: 'divider' }}>
			{/* Search and Add */}
			<Box sx={{ p: 2, display: 'flex', gap: 1 }}>
				<TextField
					placeholder='Search contacts...'
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					size='small'
					fullWidth
					InputProps={{
						startAdornment: (
							<InputAdornment position='start'>
								<SearchIcon fontSize='small' color='action' />
							</InputAdornment>
						),
					}}
				/>
				<IconButton onClick={onAddContact} color='primary' sx={{ flexShrink: 0 }}>
					<AddIcon />
				</IconButton>
				<IconButton onClick={handleMenuOpen} sx={{ flexShrink: 0 }}>
					<MoreIcon />
				</IconButton>
				<Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
					<MenuItem onClick={handleImportClick}>
						<ListItemIcon>
							<ImportIcon fontSize='small' />
						</ListItemIcon>
						<ListItemText>Import CSV</ListItemText>
					</MenuItem>
					<MenuItem onClick={handleExportClick}>
						<ListItemIcon>
							<ExportIcon fontSize='small' />
						</ListItemIcon>
						<ListItemText>Export CSV</ListItemText>
					</MenuItem>
					<MenuItem onClick={handleTemplateClick}>
						<ListItemIcon>
							<TemplateIcon fontSize='small' />
						</ListItemIcon>
						<ListItemText>Download Template</ListItemText>
					</MenuItem>
					<MenuItem onClick={handleSendReminderClick}>
						<ListItemIcon>
							<NotificationsIcon fontSize='small' />
						</ListItemIcon>
						<ListItemText>Send Reminder</ListItemText>
					</MenuItem>
				</Menu>
			</Box>

			{/* Contact List */}
			<Box sx={{ flex: 1, overflow: 'auto' }}>
				{filteredContacts.length === 0 ? (
					<Box sx={{ p: 3, textAlign: 'center' }}>
						<Typography variant='body2' color='text.secondary'>
							{searchQuery ? 'No contacts found' : 'No contacts yet'}
						</Typography>
					</Box>
				) : (
					<List disablePadding>
						{filteredContacts.map((contact) => (
							<ListItemButton
								key={contact.id}
								selected={contact.id === selectedContactId}
								onClick={() => onSelectContact(contact)}
								sx={{
									borderBottom: 1,
									borderColor: 'divider',
									'&.Mui-selected': {
										backgroundColor: 'action.selected',
									},
								}}>
								<ListItemAvatar>
									<Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>{getInitials(contact)}</Avatar>
								</ListItemAvatar>
								<ListItemText
									primary={
										<Typography variant='body1' sx={{ fontWeight: 500 }}>
											{contact.firstName} {contact.lastName}
										</Typography>
									}
									secondary={getSubtitle(contact)}
									secondaryTypographyProps={{ noWrap: true }}
								/>
							</ListItemButton>
						))}
					</List>
				)}
			</Box>

			{/* Footer with count */}
			<Box sx={{ p: 1, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
				<Typography variant='caption' color='text.secondary'>
					{filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}
				</Typography>
			</Box>
		</Box>
	);
}
