import { ColDef, RowClickedEvent, ICellRendererParams } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridReact } from 'ag-grid-react';
import { FC, useMemo, useState } from 'react';
import { classes } from '~helpers';
import { useGetUsers, useDeleteUser } from '~hooks/users';
import { UserDTO } from '~services/users/types';
import { Consumer, Undefined } from '~types/utils';
import styles from './UsersTable.module.css';
import { CONSTANTS } from '~helpers/constants';
import { Box, IconButton, Tooltip, Snackbar, Alert, Modal, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { AppButton } from '~components/atoms';

interface Props {
	onRowClick: Consumer<Undefined<UserDTO>>;
}

const isAdminFromToken = (): boolean => {
	try {
		const token = localStorage.getItem(CONSTANTS.AccessToken);
		if (!token) return false;
		const parts = token.split('.');
		if (parts.length < 2) return false;
		const payloadBase64 = parts[1] || '';
		if (!payloadBase64) return false;
		const payloadJson = JSON.parse(atob(payloadBase64));
		const authorities: string[] = payloadJson?.authorities ?? payloadJson?.roles ?? [];
		if (Array.isArray(authorities) && authorities.some((a: unknown) => String(a).toUpperCase() === 'ADMIN')) return true;
		const scope: string = payloadJson?.scope ?? '';
		if (typeof scope === 'string' && scope.toUpperCase().includes('ADMIN')) return true;
		const role: string = payloadJson?.role ?? '';
		return typeof role === 'string' && role.toUpperCase() === 'ADMIN';
	} catch {
		return false;
	}
};

export const UsersTable: FC<Props> = ({ onRowClick }) => {
	const { data, isError, isLoading } = useGetUsers();

	const isAdmin = useMemo(() => isAdminFromToken(), []);

	const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>(
		{ open: false, message: '', severity: 'success' }
	);
	const showToast = (message: string, severity: 'success' | 'error') => setToast({ open: true, message, severity });
	const handleCloseToast = () => setToast((prev) => ({ ...prev, open: false }));

	const [openDeleteModal, setOpenDeleteModal] = useState(false);
	const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);

	const { mutate: deleteUser, isLoading: isDeleting } = useDeleteUser(
		() => {
			// Close and toast on success
			setOpenDeleteModal(false);
			setSelectedUser(null);
			showToast('User deleted successfully', 'success');
		},
		(err: Error) => showToast(err?.message ?? 'Failed to delete user', 'error')
	);

	if (isError) {
		console.error('[UsersTable] get users failed');
	}

	const rowData: UserDTO[] = useMemo(() => data ?? [], [data]);

	const actionsRenderer = (params: ICellRendererParams<UserDTO>) => {
		const user = params.data as UserDTO;
		const onEdit = (e: React.MouseEvent) => {
			e.stopPropagation();
			onRowClick(user);
		};
		const onDelete = (e: React.MouseEvent) => {
			e.stopPropagation();
			setSelectedUser(user);
			setOpenDeleteModal(true);
		};
		return (
			<Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
				<Tooltip title="Edit" arrow>
					<IconButton size="small" onClick={onEdit} aria-label="Edit user">
						<EditIcon fontSize="small" sx={{ color: 'green' }} />
					</IconButton>
				</Tooltip>
				<Tooltip title="Delete" arrow>
					<IconButton size="small" onClick={onDelete} aria-label="Delete user" disabled={isDeleting}>
						<DeleteIcon fontSize="small" sx={{ color: 'red' }} />
					</IconButton>
				</Tooltip>
			</Box>
		);
	};

	const colDefs: ColDef<UserDTO>[] = useMemo(() => {
		const cols: ColDef<UserDTO>[] = [
			{ field: 'firstName' },
			{ field: 'lastName' },
			{ field: 'email' },
			{ headerName: 'Role', valueGetter: (p) => p.data?.role?.code },
		];
		if (isAdmin) {
			cols.push({ headerName: 'Actions', cellRenderer: actionsRenderer, filter: false, sortable: false, pinned: 'right', width: 180 });
		}
		return cols;
	}, [isAdmin]);

	const handleUserRowClick = (event: RowClickedEvent<UserDTO>) => {
		onRowClick(event.data);
	};

	const handleDeleteCancel = () => {
		setOpenDeleteModal(false);
		setSelectedUser(null);
	};

	const handleDeleteConfirm = () => {
		if (!selectedUser?.id) return;
		deleteUser(selectedUser.id);
	};

	return (
		<div className={classes('ag-theme-quartz', styles.container)} style={{ position: 'relative' }}>
			{/* Loading overlay */}
			{isLoading && (
				<Box
					sx={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						background: 'rgba(255,255,255,0.6)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						zIndex: 3,
					}}
				>
					<CircularProgress />
				</Box>
			)}
			<AgGridReact
				rowData={rowData}
				columnDefs={colDefs}
				defaultColDef={{
					filter: true,
				}}
				columnHoverHighlight
				onRowClicked={handleUserRowClick}
			/>

			{/* Delete confirmation modal (styled like Ship delete modal) */}
			<Modal
				open={openDeleteModal}
				onClose={handleDeleteCancel}
				aria-labelledby="delete-user-modal-title"
				aria-describedby="delete-user-modal-description"
			>
				<Box
					sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: 400,
						bgcolor: 'background.paper',
						borderRadius: '16px',
						boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
						p: 4,
						outline: 'none',
					}}
				>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: 2,
							mb: 3,
						}}
					>
						<Box
							sx={{
								backgroundColor: '#ffebee',
								borderRadius: '50%',
								width: '64px',
								height: '64px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								mb: 1,
							}}
						>
							<DeleteIcon sx={{ color: '#f44336', fontSize: '32px' }} />
						</Box>
						<Box sx={{ textAlign: 'center' }}>
							<h2
								id="delete-user-modal-title"
								style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 600 }}
							>
								Delete User
							</h2>
							<p
								id="delete-user-modal-description"
								style={{ margin: 0, color: 'rgba(0, 0, 0, 0.6)', fontSize: '16px' }}
							>
								Are you sure you want to delete this user
								{selectedUser ? (
									<>
										{' '}
										<strong>
											{selectedUser.firstName} {selectedUser.lastName}
										</strong>{' '}
										({selectedUser.email})
									</>
								) : null}
								? This action cannot be undone.
							</p>
						</Box>
					</Box>
					<Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
						<AppButton
							onClick={handleDeleteCancel}
							value="Cancel"
							variant="outlined"
							disabled={isDeleting}
							style={{ minWidth: '120px', fontWeight: 600, borderRadius: '8px', textTransform: 'none' }}
						/>
						<AppButton
							onClick={handleDeleteConfirm}
							value={isDeleting ? 'Deleting…' : 'Yes, Delete'}
							color="error"
							disabled={isDeleting}
							startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : undefined}
							style={{
								minWidth: '120px',
								fontWeight: 600,
								borderRadius: '8px',
								textTransform: 'none',
								backgroundColor: '#f44336',
							}}
						/>
					</Box>
				</Box>
			</Modal>

			<Snackbar
				open={toast.open}
				autoHideDuration={2500}
				onClose={handleCloseToast}
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
				sx={{ top: '0px !important', width: '100%', zIndex: 2000 }}
			>
				<Alert onClose={handleCloseToast} severity={toast.severity} variant="filled" sx={{ maxWidth: 500, mx: 'auto' }}>
					{toast.message}
				</Alert>
			</Snackbar>
		</div>
	);
};
