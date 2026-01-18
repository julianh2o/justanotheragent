import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import {
	Box,
	Button,
	IconButton,
	Paper,
	Typography,
	Menu,
	MenuItem,
	ListItemIcon,
	ListItemText,
	Snackbar,
	Alert,
} from '@mui/material';
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	FileDownload as ExportIcon,
	FileUpload as ImportIcon,
	Description as TemplateIcon,
} from '@mui/icons-material';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import { APP_TITLE } from '../utils/constants';
import { Contact, ChannelType, CustomFieldDefinition, Tag } from '../types';
import {
	fetchContacts,
	fetchChannelTypes,
	fetchCustomFieldDefinitions,
	fetchTags,
	deleteContact,
	getExportUrl,
	getTemplateUrl,
	importContactsCSV,
} from '../utils/contactsApi';
import ContactDialog from '../components/ContactDialog/ContactDialog';

ModuleRegistry.registerModules([AllCommunityModule]);

const PAGE_TITLE = 'Contacts';

export default function Contacts() {
	const [contacts, setContacts] = useState<Contact[]>([]);
	const [channelTypes, setChannelTypes] = useState<ChannelType[]>([]);
	const [customFieldDefs, setCustomFieldDefs] = useState<CustomFieldDefinition[]>([]);
	const [tags, setTags] = useState<Tag[]>([]);
	const [loading, setLoading] = useState(true);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingContact, setEditingContact] = useState<Contact | null>(null);
	const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
	const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
		open: false,
		message: '',
		severity: 'success',
	});
	const fileInputRef = useRef<HTMLInputElement | null>(null);

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
		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const handleCreate = () => {
		setEditingContact(null);
		setDialogOpen(true);
	};

	const handleEdit = useCallback((contact: Contact) => {
		setEditingContact(contact);
		setDialogOpen(true);
	}, []);

	const handleDelete = useCallback(
		async (contact: Contact) => {
			if (window.confirm(`Are you sure you want to delete ${contact.firstName} ${contact.lastName || ''}?`)) {
				try {
					await deleteContact(contact.id);
					loadData();
				} catch (error) {
					console.error('Error deleting contact:', error);
				}
			}
		},
		[loadData],
	);

	const handleDialogClose = () => {
		setDialogOpen(false);
		setEditingContact(null);
	};

	const handleDialogSave = () => {
		setDialogOpen(false);
		setEditingContact(null);
		loadData();
	};

	const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setMenuAnchor(event.currentTarget);
	};

	const handleMenuClose = () => {
		setMenuAnchor(null);
	};

	const handleExport = () => {
		window.open(getExportUrl(), '_blank');
		handleMenuClose();
	};

	const handleDownloadTemplate = () => {
		window.open(getTemplateUrl(), '_blank');
		handleMenuClose();
	};

	const handleImportClick = () => {
		handleMenuClose();
		fileInputRef.current?.click();
	};

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		try {
			const csv = await file.text();
			const result = await importContactsCSV(csv);

			if (result.errors.length > 0) {
				console.error('Import errors:', result.errors);
				setSnackbar({
					open: true,
					message: `Imported ${result.imported} contacts with ${result.errors.length} errors. Check console for details.`,
					severity: result.imported > 0 ? 'success' : 'error',
				});
			} else {
				setSnackbar({
					open: true,
					message: `Successfully imported ${result.imported} contacts.`,
					severity: 'success',
				});
			}
			loadData();
		} catch (error) {
			console.error('Import failed:', error);
			setSnackbar({
				open: true,
				message: 'Failed to import contacts.',
				severity: 'error',
			});
		}

		// Reset file input
		event.target.value = '';
	};

	const handleSnackbarClose = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	const getPrimaryChannel = (contact: Contact, type: string): string => {
		const channel = contact.channels.find((c) => c.type === type && c.isPrimary);
		if (channel) return channel.identifier;
		const firstOfType = contact.channels.find((c) => c.type === type);
		return firstOfType?.identifier || '';
	};

	const columnDefs: ColDef<Contact>[] = useMemo(
		() => [
			{
				headerName: 'First Name',
				field: 'firstName',
				filter: true,
				sortable: true,
				flex: 1,
			},
			{
				headerName: 'Last Name',
				field: 'lastName',
				filter: true,
				sortable: true,
				flex: 1,
			},
			{
				headerName: 'Phone',
				valueGetter: (params) => (params.data ? getPrimaryChannel(params.data, 'phone') : ''),
				filter: true,
				sortable: true,
				flex: 1,
			},
			{
				headerName: 'Email',
				valueGetter: (params) => (params.data ? getPrimaryChannel(params.data, 'email') : ''),
				filter: true,
				sortable: true,
				flex: 1.5,
			},
			{
				headerName: 'Tags',
				valueGetter: (params) => params.data?.tags.map((t) => t.tag.name).join(', ') || '',
				filter: true,
				sortable: true,
				flex: 1,
			},
			{
				headerName: 'Outreach (days)',
				field: 'outreachFrequencyDays',
				filter: 'agNumberColumnFilter',
				sortable: true,
				width: 140,
			},
			{
				headerName: 'Actions',
				cellRenderer: (params: ICellRendererParams<Contact>) => {
					if (!params.data) return null;
					return (
						<Box sx={{ display: 'flex', gap: 0.5 }}>
							<IconButton size='small' onClick={() => handleEdit(params.data!)}>
								<EditIcon fontSize='small' />
							</IconButton>
							<IconButton size='small' onClick={() => handleDelete(params.data!)}>
								<DeleteIcon fontSize='small' />
							</IconButton>
						</Box>
					);
				},
				width: 100,
				sortable: false,
				filter: false,
			},
		],
		[handleDelete, handleEdit],
	);

	const defaultColDef: ColDef = useMemo(
		() => ({
			resizable: true,
		}),
		[],
	);

	return (
		<>
			<Helmet>
				<title>
					{PAGE_TITLE} | {APP_TITLE}
				</title>
			</Helmet>
			<Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
					<Typography variant='h4'>{PAGE_TITLE}</Typography>
					<Box sx={{ display: 'flex', gap: 1 }}>
						<Button variant='outlined' onClick={handleMenuOpen}>
							Import / Export
						</Button>
						<Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
							<MenuItem onClick={handleImportClick}>
								<ListItemIcon>
									<ImportIcon fontSize='small' />
								</ListItemIcon>
								<ListItemText>Import CSV</ListItemText>
							</MenuItem>
							<MenuItem onClick={handleExport}>
								<ListItemIcon>
									<ExportIcon fontSize='small' />
								</ListItemIcon>
								<ListItemText>Export CSV</ListItemText>
							</MenuItem>
							<MenuItem onClick={handleDownloadTemplate}>
								<ListItemIcon>
									<TemplateIcon fontSize='small' />
								</ListItemIcon>
								<ListItemText>Download Template</ListItemText>
							</MenuItem>
						</Menu>
						<input
							type='file'
							ref={fileInputRef}
							style={{ display: 'none' }}
							accept='.csv'
							onChange={handleFileChange}
						/>
						<Button variant='contained' startIcon={<AddIcon />} onClick={handleCreate}>
							Add Contact
						</Button>
					</Box>
				</Box>
				<Paper sx={{ flex: 1, overflow: 'hidden' }}>
					<Box className='ag-theme-alpine-dark' sx={{ height: '100%', width: '100%' }}>
						<AgGridReact<Contact>
							rowData={contacts}
							columnDefs={columnDefs}
							defaultColDef={defaultColDef}
							loading={loading}
							animateRows={true}
							rowSelection='single'
							onRowDoubleClicked={(event) => event.data && handleEdit(event.data)}
						/>
					</Box>
				</Paper>
			</Box>
			<ContactDialog
				open={dialogOpen}
				contact={editingContact}
				channelTypes={channelTypes}
				customFieldDefs={customFieldDefs}
				tags={tags}
				onClose={handleDialogClose}
				onSave={handleDialogSave}
				onTagsChange={setTags}
			/>
			<Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
				<Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</>
	);
}
