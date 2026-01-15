import { Box, Modal, IconButton, Autocomplete, TextField, Button, ButtonGroup } from '@mui/material';
import { ColDef, IDateFilterParams } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridReact, CustomCellRendererProps } from 'ag-grid-react';
import dayjs, { Dayjs } from 'dayjs';
import { FC, useMemo, useRef, useState } from 'react';
import { AppButton, DocumentViewer } from '~components/atoms';
import { classes } from '~helpers';
import { CONSTANTS } from '~helpers/constants';
import { useTranslation } from '~i18n';
import { addShipService } from '~services/addShip';
import { ShipDTO } from '~services/addShip/types';
import styles from './ShipsTable.module.css';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import InfoIcon from '@mui/icons-material/Info';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import ChatIcon from '@mui/icons-material/Chat';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Tooltip } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const ADD_SHIP = 'add-ship';

interface ShipRow {
	name: string;
	imo: string;
	dwt: string;
	boardingPort: string;
	completionDate: string;
	agent: string;
	shipDocuments: string[];
	charterDocuments: string[];
	receiverDocuments: string[];
	cargoType?: string;
	cargoCategory?: string;
}

const mapShipDtoToShipRow = (dto: ShipDTO): ShipRow => {
	return {
		name: dto.name,
		imo: dto.imo,
		dwt: dto.dwt,
		boardingPort: dto.boardingPort,
		completionDate: dto.completionDate,
		agent: dto.agent || 'NAVLION',
		shipDocuments: dto.shipDocuments,
		charterDocuments: dto.charterDocuments,
		receiverDocuments: dto.receiverDocuments,
		// Derive a simple cargo type display: show first cargo type or join unique types
		cargoType:
			(dto.cargoes && dto.cargoes.length > 0 ? Array.from(new Set(dto.cargoes.map((c: any) => c.type))).join(', ') : ''),
		// Derive cargo categories (unique)
		cargoCategory:
			(dto.cargoes && dto.cargoes.length > 0 ? Array.from(new Set(dto.cargoes.map((c: any) => c.category))).join(', ') : ''),
	};
};

var dateFilterParams: IDateFilterParams = {
	comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
		const selectedDate = dayjs(filterLocalDateAtMidnight);
		const currentDate = dayjs(cellValue);

		if (currentDate.isBefore(selectedDate)) {
			return -1;
		}

		if (currentDate.isAfter(selectedDate)) {
			return 1;
		}

		return 0;
	},
};

const renderDate = (data: CustomCellRendererProps<ShipRow>) => {
	return dayjs(data.value).format('DD-MM-YYYY - HH:mm');
};

const renderImo = (data: CustomCellRendererProps<ShipRow>) => {
	const [openCargoesModal, setOpenCargoesModal] = useState(false);
	const shipData = data.context.shipDtoMap.get(data.data?.imo);

	const handleDoubleClick = () => {
		setOpenCargoesModal(true);
	};

	const handleCloseCargoesModal = () => {
		setOpenCargoesModal(false);
	};

	// Calculate total tonnage for this ship
	const calculateTotalTonnage = () => {
		if (!shipData?.cargoes) return 0;
		return shipData.cargoes.reduce((sum: number, cargo: any) => {
			const tonnage = parseFloat(cargo.tonnage || '0');
			return sum + (isNaN(tonnage) ? 0 : tonnage);
		}, 0);
	};

	// Export ship cargoes to PDF
	const handleExportCargosPdf = async () => {
		try {
			const token = localStorage.getItem('ACCESS_TOKEN');
			const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
			const url = `${API_BASE_URL}/ships/${shipData.id}/export/pdf`;
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Accept': 'application/pdf',
					...(token ? { 'Authorization': `Bearer ${token}` } : {}),
				},
			});
			if (!response.ok) throw new Error('Failed to export PDF');
			const blob = await response.blob();
			const urlBlob = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = urlBlob;
			link.download = `ship_${shipData.imo}_cargoes.pdf`;
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(urlBlob);
			data.context.showToast?.('PDF exported successfully', 'success');
		} catch (err) {
			console.error('Failed to export PDF:', err);
			data.context.showToast?.('Failed to export PDF', 'error');
		}
	};

	if (!shipData) {
		return <span>{data.value}</span>;
	}

	return (
		<>
			<span
				onDoubleClick={handleDoubleClick}
				style={{
					cursor: 'pointer',
					textDecoration: 'underline',
					color: '#1976d2',
				}}
			>
				{data.value}
			</span>

			{/* Cargoes Modal */}
			<Modal
				open={openCargoesModal}
				onClose={handleCloseCargoesModal}
				aria-labelledby="cargoes-modal-title"
				aria-describedby="cargoes-modal-description"
			>
				<Box
					sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: 900,
						maxHeight: '80vh',
						overflow: 'auto',
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
							justifyContent: 'space-between',
							alignItems: 'center',
							mb: 3,
						}}
					>
						<h2
							id="cargoes-modal-title"
							style={{
								margin: 0,
								fontSize: '22px',
								fontWeight: 600,
							}}
						>
							{shipData.name} - Cargoes
						</h2>
						<IconButton
							onClick={handleCloseCargoesModal}
							aria-label="Close"
							size="small"
							sx={{
								color: 'rgba(0, 0, 0, 0.54)',
							}}
						>
							<CloseIcon />
						</IconButton>
					</Box>

					{/* Total Tonnage Display */}
					<Box
						sx={{
							mb: 2,
							p: 2,
							bgcolor: '#f5f5f5',
							borderRadius: 2,
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
					>
						<Box>
							<strong style={{ fontSize: '16px' }}>Total Tonnage:</strong>
							<span style={{ fontSize: '18px', fontWeight: 600, marginLeft: '12px', color: '#1976d2' }}>
								{calculateTotalTonnage().toLocaleString()} MT
							</span>
						</Box>
						<Box>
							<strong>Total Cargoes:</strong>
							<span style={{ marginLeft: '8px' }}>{shipData.cargoes?.length || 0}</span>
						</Box>
					</Box>

					<Box sx={{ mt: 2 }}>
						{shipData.cargoes && shipData.cargoes.length > 0 ? (
							<table
								style={{
									width: '100%',
									borderCollapse: 'collapse',
									fontSize: '14px',
									border: '1px solid rgba(224, 224, 224, 1)',
								}}
							>
								<thead>
									<tr>
										<th
											style={{
												padding: '8px',
												textAlign: 'left',
												backgroundColor: '#f5f5f5',
												borderBottom: '1px solid rgba(224, 224, 224, 1)',
											}}
										>
											Type
										</th>
										<th
											style={{
												padding: '8px',
												textAlign: 'left',
												backgroundColor: '#f5f5f5',
												borderBottom: '1px solid rgba(224, 224, 224, 1)',
											}}
										>
											Category
										</th>
										<th
											style={{
												padding: '8px',
												textAlign: 'left',
												backgroundColor: '#f5f5f5',
												borderBottom: '1px solid rgba(224, 224, 224, 1)',
											}}
										>
											Sub Category
										</th>
										<th
											style={{
												padding: '8px',
												textAlign: 'left',
												backgroundColor: '#f5f5f5',
												borderBottom: '1px solid rgba(224, 224, 224, 1)',
											}}
										>
											Tonnage
										</th>
										<th
											style={{
												padding: '8px',
												textAlign: 'left',
												backgroundColor: '#f5f5f5',
												borderBottom: '1px solid rgba(224, 224, 224, 1)',
											}}
										>
											Receiver
										</th>
										<th
											style={{
												padding: '8px',
												textAlign: 'left',
												backgroundColor: '#f5f5f5',
												borderBottom: '1px solid rgba(224, 224, 224, 1)',
											}}
										>
											Fournisseur
										</th>
									</tr>
								</thead>
								<tbody>
									{shipData.cargoes.map((cargo: any, idx: number) => (
										<tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
											<td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
												{cargo.type || 'N/A'}
											</td>
											<td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
												{cargo.category || 'N/A'}
											</td>
											<td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
												{cargo.subCategory || 'N/A'}
											</td>
											<td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
												{cargo.tonnage || 'N/A'}
											</td>
											<td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
												{cargo.receiverName || 'N/A'}
											</td>
											<td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
												{cargo.fournisseurName || 'N/A'}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						) : (
							<Box sx={{ color: 'text.secondary', fontStyle: 'italic' }}>No cargoes available</Box>
						)}
					</Box>

					<Box
						sx={{
							display: 'flex',
							justifyContent: 'flex-end',
							gap: 2,
							mt: 3,
						}}
					>
						<AppButton
							onClick={handleExportCargosPdf}
							value="Export PDF"
							variant="contained"
							sx={{
								minWidth: '120px',
								fontWeight: 600,
								borderRadius: '8px',
								textTransform: 'none',
							}}
						/>
						<AppButton
							onClick={handleCloseCargoesModal}
							value="Close"
							variant="outlined"
							sx={{
								minWidth: '120px',
								fontWeight: 600,
								borderRadius: '8px',
								textTransform: 'none',
							}}
						/>
					</Box>
				</Box>
			</Modal>
		</>
	);
};

const renderAgent = (data: CustomCellRendererProps<ShipRow>) => {
	const [openAgentModal, setOpenAgentModal] = useState(false);
	const [agentShips, setAgentShips] = useState<ShipDTO[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const agentName = data.value || 'NAVLION';

	const handleAgentClick = async () => {
		setOpenAgentModal(true);
		setIsLoading(true);
		try {
			const ships = await addShipService.getShipsByAgent(agentName);
			setAgentShips(ships);
		} catch (error) {
			console.error('Failed to fetch agent ships:', error);
			data.context.showToast?.('Failed to load agent ships', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	const calculateTotalTonnage = () => {
		return agentShips.reduce((sum, ship) => {
			const dwt = parseFloat(ship.dwt || '0');
			return sum + (isNaN(dwt) ? 0 : dwt);
		}, 0);
	};

	const calculateTotalCargoes = () => {
		return agentShips.reduce((sum, ship) => sum + (ship.cargoes?.length || 0), 0);
	};

	return (
		<>
			<span
				onClick={handleAgentClick}
				style={{
					cursor: 'pointer',
					textDecoration: 'underline',
					color: '#1976d2',
				}}
			>
				{agentName}
			</span>

			{/* Agent Details Modal */}
			<Modal
				open={openAgentModal}
				onClose={() => setOpenAgentModal(false)}
				aria-labelledby="agent-modal-title"
			>
				<Box
					sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: 1000,
						maxHeight: '80vh',
						overflow: 'auto',
						bgcolor: 'background.paper',
						borderRadius: '16px',
						boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
						p: 4,
						outline: 'none',
					}}
				>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
						<h2 id="agent-modal-title" style={{ margin: 0, fontSize: '22px', fontWeight: 600 }}>
							Agent: {agentName}
						</h2>
						<IconButton onClick={() => setOpenAgentModal(false)} aria-label="Close" size="small">
							<CloseIcon />
						</IconButton>
					</Box>

					{isLoading ? (
						<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
							<Box className="loading-spinner" />
						</Box>
					) : (
						<>
							{/* Statistics */}
							<Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2, display: 'flex', gap: 4 }}>
								<Box>
									<strong>Total Ships:</strong>
									<span style={{ marginLeft: '8px', fontSize: '18px', fontWeight: 600, color: '#1976d2' }}>
										{agentShips.length}
									</span>
								</Box>
								<Box>
									<strong>Total DWT:</strong>
									<span style={{ marginLeft: '8px', fontSize: '18px', fontWeight: 600, color: '#1976d2' }}>
										{calculateTotalTonnage().toLocaleString()} MT
									</span>
								</Box>
								<Box>
									<strong>Total Cargoes:</strong>
									<span style={{ marginLeft: '8px', fontSize: '18px', fontWeight: 600, color: '#1976d2' }}>
										{calculateTotalCargoes()}
									</span>
								</Box>
							</Box>

							{/* Ships List */}
							<Box sx={{ mt: 2 }}>
								{agentShips.length > 0 ? (
									<table
										style={{
											width: '100%',
											borderCollapse: 'collapse',
											fontSize: '14px',
											border: '1px solid rgba(224, 224, 224, 1)',
										}}
									>
										<thead>
											<tr>
												<th style={{ padding: '8px', textAlign: 'left', backgroundColor: '#f5f5f5', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
													Ship Name
												</th>
												<th style={{ padding: '8px', textAlign: 'left', backgroundColor: '#f5f5f5', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
													IMO
												</th>
												<th style={{ padding: '8px', textAlign: 'left', backgroundColor: '#f5f5f5', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
													DWT
												</th>
												<th style={{ padding: '8px', textAlign: 'left', backgroundColor: '#f5f5f5', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
													Port
												</th>
												<th style={{ padding: '8px', textAlign: 'left', backgroundColor: '#f5f5f5', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
													Completion Date
												</th>
												<th style={{ padding: '8px', textAlign: 'left', backgroundColor: '#f5f5f5', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
													Cargoes
												</th>
											</tr>
										</thead>
										<tbody>
											{agentShips.map((ship, idx) => (
												<tr key={ship.id} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
													<td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
														{ship.name}
													</td>
													<td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
														{ship.imo}
													</td>
													<td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
														{ship.dwt}
													</td>
													<td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
														{ship.boardingPort}
													</td>
													<td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
														{ship.completionDate ? dayjs(ship.completionDate).format('DD-MM-YYYY') : 'N/A'}
													</td>
													<td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
														{ship.cargoes?.length || 0}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								) : (
									<Box sx={{ color: 'text.secondary', fontStyle: 'italic' }}>No ships found for this agent</Box>
								)}
							</Box>

							<Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
								<AppButton
									onClick={() => setOpenAgentModal(false)}
									value="Close"
									variant="outlined"
									sx={{
										minWidth: '120px',
										fontWeight: 600,
										borderRadius: '8px',
										textTransform: 'none',
									}}
								/>
							</Box>
						</>
					)}
				</Box>
			</Modal>
		</>
	);
};

const renderActions = (data: CustomCellRendererProps<ShipRow>) => {
	const t = useTranslation();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [isDeleting, setIsDeleting] = useState(false);
	const [openDeleteModal, setOpenDeleteModal] = useState(false);
	const [openDocumentsModal, setOpenDocumentsModal] = useState(false);
	const [openInfoModal, setOpenInfoModal] = useState(false);

	const shipData = data.context.shipDtoMap.get(data.data?.imo);

	if (!shipData) {
		return null;
	}

	const handleDeleteConfirm = async () => {
		try {
			setIsDeleting(true);
			await addShipService.deleteShip(shipData.id);
			setOpenDeleteModal(false);
			queryClient.invalidateQueries({ queryKey: [ADD_SHIP] });
			data.context.showToast?.(`Ship ${shipData.name} has been successfully deleted`, 'success');
		} catch (error) {
			console.error('Failed to delete ship:', error);
			setOpenDeleteModal(false);
			const msg = `Failed to delete ship: ${error instanceof Error ? error.message : 'Unknown error'}`;
			data.context.showToast?.(msg, 'error');
		} finally {
			setIsDeleting(false);
		}
	};

	const handleDeleteCancel = () => {
		setOpenDeleteModal(false);
	};

	const handleUpdate = () => {
		navigate(`/report/update/${shipData.id}`);
	};

	const handleViewDocuments = () => {
		setOpenDocumentsModal(true);
	};

	const handleCloseDocumentsModal = () => {
		setOpenDocumentsModal(false);
	};

	const handleViewInfo = () => {
		setOpenInfoModal(true);
	};

	const handleCloseInfoModal = () => {
		setOpenInfoModal(false);
	};

	const handlePrintShipDetails = async () => {
		try {
			const token = localStorage.getItem('ACCESS_TOKEN');
			const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
			const url = `${API_BASE_URL}/ships/${shipData.id}/export/pdf`;
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Accept': 'application/pdf',
					...(token ? { 'Authorization': `Bearer ${token}` } : {}),
				},
			});
			if (!response.ok) throw new Error('Failed to generate PDF');
			const blob = await response.blob();
			const urlBlob = window.URL.createObjectURL(blob);
			window.open(urlBlob, '_blank'); // Open in new tab for printing
			data.context.showToast?.('Ship details opened for printing', 'success');
		} catch (err) {
			console.error('Failed to generate ship details:', err);
			data.context.showToast?.('Failed to generate ship details', 'error');
		}
	};

	return (
		<>
			<Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
				<Tooltip title={t('common.edit')} arrow>
					<Box
						sx={{
							backgroundColor: 'transparent',
							borderRadius: '8px',
							width: '36px',
							height: '36px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							boxShadow: '0',
							transition: 'all 0.2s ease',
							'&:hover': {
								transform: 'translateY(0px)',
								backgroundColor: 'white',
							},
							cursor: 'pointer',
						}}
						onClick={handleUpdate}
						aria-label={t('common.edit')}
					>
						<EditIcon sx={{ color: 'green', fontSize: '20px' }} />
					</Box>
				</Tooltip>
				<Tooltip title={t('common.delete')} arrow>
					<Box
						sx={{
							backgroundColor: 'transparent',
							borderRadius: '8px',
							width: '36px',
							height: '36px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							boxShadow: '',
							transition: 'all 0.2s ease',
							'&:hover': {
								transform: 'translateY(0px)',
								backgroundColor: 'white',
							},
							cursor: isDeleting ? 'default' : 'pointer',
							opacity: isDeleting ? 0.7 : 1,
						}}
						onClick={() => !isDeleting && setOpenDeleteModal(true)}
						aria-label={t('common.delete')}
					>
						<DeleteIcon sx={{ color: 'red', fontSize: '20px' }} />
					</Box>
				</Tooltip>
				<Tooltip title="View Documents" arrow>
					<Box
						sx={{
							backgroundColor: 'transparent',
							borderRadius: '8px',
							width: '36px',
							height: '36px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							boxShadow: '',
							transition: 'all 0.2s ease',
							'&:hover': {
								transform: 'translateY(0px)',
								backgroundColor: 'white',
							},
							cursor: 'pointer',
						}}
						onClick={handleViewDocuments}
						aria-label="View Documents"
					>
						<DescriptionIcon sx={{ color: '#1976d2', fontSize: '20px' }} />
					</Box>
				</Tooltip>
				<Tooltip title="View Contact Info" arrow>
					<Box
						sx={{
							backgroundColor: 'transparent',
							borderRadius: '8px',
							width: '36px',
							height: '36px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							boxShadow: '',
							transition: 'all 0.2s ease',
							'&:hover': {
								transform: 'translateY(0px)',
								backgroundColor: 'white',
							},
							cursor: 'pointer',
						}}
						onClick={handleViewInfo}
						aria-label="View Contact Info"
					>
						<InfoIcon sx={{ color: '#9c27b0', fontSize: '20px' }} />
					</Box>
				</Tooltip>
			</Box>

			{/* Confirmation Modal */}
			<Modal
				open={openDeleteModal}
				onClose={handleDeleteCancel}
				aria-labelledby="delete-ship-modal-title"
				aria-describedby="delete-ship-modal-description"
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
								id="delete-ship-modal-title"
								style={{
									margin: '0 0 8px 0',
									fontSize: '24px',
									fontWeight: 600,
								}}
							>
								Delete Ship
							</h2>
							<p
								id="delete-ship-modal-description"
								style={{
									margin: 0,
									color: 'rgba(0, 0, 0, 0.6)',
									fontSize: '16px',
								}}
							>
								Are you sure you want to delete this ship <strong>{shipData.name}</strong>? This action cannot be
								undone.
							</p>
						</Box>
					</Box>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'center',
							gap: 2,
							mt: 3,
						}}
					>
						<AppButton
							onClick={handleDeleteCancel}
							value="Cancel"
							variant="outlined"
							sx={{
								minWidth: '120px',
								fontWeight: 600,
								borderRadius: '8px',
								textTransform: 'none',
							}}
						/>
						<AppButton
							onClick={handleDeleteConfirm}
							value="Yes, Delete"
							color="error"
							disabled={isDeleting}
							startIcon={isDeleting ? <span className="loading-spinner" /> : undefined}
							sx={{
								minWidth: '120px',
								fontWeight: 600,
								borderRadius: '8px',
								textTransform: 'none',
								backgroundColor: '#f44336',
								'&:hover': {
									backgroundColor: '#d32f2f',
								},
							}}
						/>
					</Box>
				</Box>
			</Modal>

			{/* Documents Modal */}
			<Modal
				open={openDocumentsModal}
				onClose={handleCloseDocumentsModal}
				aria-labelledby="documents-modal-title"
				aria-describedby="documents-modal-description"
			>
				<Box
					sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: 700,
						maxHeight: '80vh',
						overflow: 'auto',
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
							justifyContent: 'space-between',
							alignItems: 'center',
							mb: 3,
						}}
					>
						<h2
							id="documents-modal-title"
							style={{
								margin: 0,
								fontSize: '22px',
								fontWeight: 600,
							}}
						>
							{shipData.name} - Documents
						</h2>
						<IconButton
							onClick={handleCloseDocumentsModal}
							aria-label="Close"
							size="small"
							sx={{
								color: 'rgba(0, 0, 0, 0.54)',
							}}
						>
							<CloseIcon />
						</IconButton>
					</Box>

					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							gap: 4,
						}}
					>
						{/* Ship Documents */}
						<Box>
							<h3 style={{ fontSize: '18px', marginTop: 0, marginBottom: '12px' }}>Ship Documents</h3>
							{shipData.shipDocuments && shipData.shipDocuments.length > 0 ? (
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
									{shipData.shipDocuments.map((documentId: string, index: number) => (
										<DocumentViewer key={documentId} id={documentId} filename={`ship-document-${index + 1}`} />
									))}
								</Box>
							) : (
								<Box sx={{ color: 'text.secondary', fontStyle: 'italic' }}>No ship documents available</Box>
							)}
						</Box>

						{/* Charter Documents */}
						<Box>
							<h3 style={{ fontSize: '18px', marginTop: 0, marginBottom: '12px' }}>Charter Documents</h3>
							{shipData.charterDocuments && shipData.charterDocuments.length > 0 ? (
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
									{shipData.charterDocuments.map((documentId: string, index: number) => (
										<DocumentViewer key={documentId} id={documentId} filename={`charter-document-${index + 1}`} />
									))}
								</Box>
							) : (
								<Box sx={{ color: 'text.secondary', fontStyle: 'italic' }}>No charter documents available</Box>
							)}
						</Box>

						{/* Receiver Documents */}
						<Box>
							<h3 style={{ fontSize: '18px', marginTop: 0, marginBottom: '12px' }}>Receiver Documents</h3>
							{shipData.receiverDocuments && shipData.receiverDocuments.length > 0 ? (
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
									{shipData.receiverDocuments.map((documentId: string, index: number) => (
										<DocumentViewer key={documentId} id={documentId} filename={`receiver-document-${index + 1}`} />
									))}
								</Box>
							) : (
								<Box sx={{ color: 'text.secondary', fontStyle: 'italic' }}>No receiver documents available</Box>
							)}
						</Box>
					</Box>

					<Box
						sx={{
							display: 'flex',
							justifyContent: 'flex-end',
							mt: 3,
						}}
					>
						<AppButton
							onClick={handleCloseDocumentsModal}
							value="Close"
							variant="outlined"
							sx={{
								minWidth: '120px',
								fontWeight: 600,
								borderRadius: '8px',
								textTransform: 'none',
							}}
						/>
					</Box>
				</Box>
			</Modal>

			{/* Contact Info Modal */}
			<Modal
				open={openInfoModal}
				onClose={handleCloseInfoModal}
				aria-labelledby="info-modal-title"
				aria-describedby="info-modal-description"
			>
				<Box
					sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: 700,
						maxHeight: '80vh',
						overflow: 'auto',
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
							justifyContent: 'space-between',
							alignItems: 'center',
							mb: 3,
						}}
					>
						<h2
							id="info-modal-title"
							style={{
								margin: 0,
								fontSize: '22px',
								fontWeight: 600,
							}}
						>
							{shipData.name} - Contact Information
						</h2>
						<IconButton
							onClick={handleCloseInfoModal}
							aria-label="Close"
							size="small"
							sx={{
								color: 'rgba(0, 0, 0, 0.54)',
							}}
						>
							<CloseIcon />
						</IconButton>
					</Box>

					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							gap: 3,
						}}
					>
						{/* Ship Owner */}
						<Box
							sx={{
								p: 3,
								bgcolor: '#f5f5f5',
								borderRadius: '12px',
							}}
						>
							<h3 style={{ fontSize: '18px', marginTop: 0, marginBottom: '16px', color: '#1976d2' }}>Ship Owner</h3>
							{shipData.shipOwner ? (
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
									{shipData.shipOwner.name && (
										<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
											<strong>Name:</strong>
											<span>{shipData.shipOwner.name}</span>
											<Tooltip title="Contact Info" arrow>
												<IconButton
													size="small"
													sx={{
														color: '#EA4335',
														'&:hover': {
															backgroundColor: 'rgba(234, 67, 53, 0.1)',
														},
													}}
													onClick={() => {
														window.location.href = `mailto:${shipData.shipOwner.name}`;
													}}
												>
													<EmailIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</Box>
									)}
									{shipData.shipOwner.phoneNumber && (
										<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
											<strong>Phone:</strong>
											<span>{shipData.shipOwner.phoneNumber}</span>
											<Tooltip title="Call via WhatsApp" arrow>
												<IconButton
													size="small"
													sx={{
														color: '#25D366',
														'&:hover': {
															backgroundColor: 'rgba(37, 211, 102, 0.1)',
														},
													}}
													onClick={() =>
														window.open(
															`https://wa.me/${shipData.shipOwner.phoneNumber.replace(/[^0-9]/g, '')}`,
															'_blank'
														)
													}
												>
													<PhoneIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</Box>
									)}
									{shipData.shipOwner.whatsAppNumber && (
										<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
											<strong>WhatsApp:</strong>
											<span>{shipData.shipOwner.whatsAppNumber}</span>
											<Tooltip title="Chat on WhatsApp" arrow>
												<IconButton
													size="small"
													sx={{
														color: '#25D366',
														'&:hover': {
															backgroundColor: 'rgba(37, 211, 102, 0.1)',
														},
													}}
													onClick={() =>
														window.open(
															`https://wa.me/${shipData.shipOwner.whatsAppNumber.replace(/[^0-9]/g, '')}`,
															'_blank'
														)
													}
												>
													<WhatsAppIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</Box>
									)}
									{shipData.shipOwner.weChatNumber && (
										<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
											<strong>WeChat:</strong>
											<span>{shipData.shipOwner.weChatNumber}</span>
											<Tooltip title="Open WeChat" arrow>
												<IconButton
													size="small"
													sx={{
														color: '#07C160',
														'&:hover': {
															backgroundColor: 'rgba(7, 193, 96, 0.1)',
														},
													}}
													onClick={() => window.open(`weixin://dl/chat?${shipData.shipOwner.weChatNumber}`, '_blank')}
												>
													<ChatIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</Box>
									)}
								</Box>
							) : (
								<Box sx={{ color: 'text.secondary', fontStyle: 'italic' }}>No ship owner information available</Box>
							)}
						</Box>

						{/* Operation Department */}
						<Box
							sx={{
								p: 3,
								bgcolor: '#f5f5f5',
								borderRadius: '12px',
							}}
						>
							<h3 style={{ fontSize: '18px', marginTop: 0, marginBottom: '16px', color: '#2e7d32' }}>
								Operation Department
							</h3>
							{shipData.operationDepart ? (
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
									{shipData.operationDepart.name && (
										<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
											<strong>Name:</strong>
											<span>{shipData.operationDepart.name}</span>
											<Tooltip title="Contact Info" arrow>
												<IconButton
													size="small"
													sx={{
														color: '#EA4335',
														'&:hover': {
															backgroundColor: 'rgba(234, 67, 53, 0.1)',
														},
													}}
													onClick={() => {
														window.location.href = `mailto:${shipData.operationDepart.name}`;
													}}
												>
													<EmailIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</Box>
									)}
									{shipData.operationDepart.phoneNumber && (
										<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
											<strong>Phone:</strong>
											<span>{shipData.operationDepart.phoneNumber}</span>
											<Tooltip title="Call via WhatsApp" arrow>
												<IconButton
													size="small"
													sx={{
														color: '#25D366',
														'&:hover': {
															backgroundColor: 'rgba(37, 211, 102, 0.1)',
														},
													}}
													onClick={() =>
														window.open(
															`https://wa.me/${shipData.operationDepart.phoneNumber.replace(/[^0-9]/g, '')}`,
															'_blank'
														)
													}
												>
													<PhoneIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</Box>
									)}
									{shipData.operationDepart.whatsAppNumber && (
										<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
											<strong>WhatsApp:</strong>
											<span>{shipData.operationDepart.whatsAppNumber}</span>
											<Tooltip title="Chat on WhatsApp" arrow>
												<IconButton
													size="small"
													sx={{
														color: '#25D366',
														'&:hover': {
															backgroundColor: 'rgba(37, 211, 102, 0.1)',
														},
													}}
													onClick={() =>
														window.open(
															`https://wa.me/${shipData.operationDepart.whatsAppNumber.replace(/[^0-9]/g, '')}`,
															'_blank'
														)
													}
												>
													<WhatsAppIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</Box>
									)}
									{shipData.operationDepart.weChatNumber && (
										<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
											<strong>WeChat:</strong>
											<span>{shipData.operationDepart.weChatNumber}</span>
											<Tooltip title="Open WeChat" arrow>
												<IconButton
													size="small"
													sx={{
														color: '#07C160',
														'&:hover': {
															backgroundColor: 'rgba(7, 193, 96, 0.1)',
														},
													}}
													onClick={() =>
														window.open(`weixin://dl/chat?${shipData.operationDepart.weChatNumber}`, '_blank')
													}
												>
													<ChatIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</Box>
									)}
								</Box>
							) : (
								<Box sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
									No operation department information available
								</Box>
							)}
						</Box>

						{/* Chartering Department */}
						<Box
							sx={{
								p: 3,
								bgcolor: '#f5f5f5',
								borderRadius: '12px',
							}}
						>
							<h3 style={{ fontSize: '18px', marginTop: 0, marginBottom: '16px', color: '#9c27b0' }}>
								Chartering Department
							</h3>
							{shipData.chartingDepart ? (
								<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
									{shipData.chartingDepart.name && (
										<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
											<strong>Name:</strong>
											<span>{shipData.chartingDepart.name}</span>
											<Tooltip title="Contact Info" arrow>
												<IconButton
													size="small"
													sx={{
														color: '#EA4335',
														'&:hover': {
															backgroundColor: 'rgba(234, 67, 53, 0.1)',
														},
													}}
													onClick={() => {
														window.location.href = `mailto:${shipData.chartingDepart.name}`;
													}}
												>
													<EmailIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</Box>
									)}
									{shipData.chartingDepart.phoneNumber && (
										<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
											<strong>Phone:</strong>
											<span>{shipData.chartingDepart.phoneNumber}</span>
											<Tooltip title="Call via WhatsApp" arrow>
												<IconButton
													size="small"
													sx={{
														color: '#25D366',
														'&:hover': {
															backgroundColor: 'rgba(37, 211, 102, 0.1)',
														},
													}}
													onClick={() =>
														window.open(
															`https://wa.me/${shipData.chartingDepart.phoneNumber.replace(/[^0-9]/g, '')}`,
															'_blank'
														)
													}
												>
													<PhoneIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</Box>
									)}
									{shipData.chartingDepart.whatsAppNumber && (
										<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
											<strong>WhatsApp:</strong>
											<span>{shipData.chartingDepart.whatsAppNumber}</span>
											<Tooltip title="Chat on WhatsApp" arrow>
												<IconButton
													size="small"
													sx={{
														color: '#25D366',
														'&:hover': {
															backgroundColor: 'rgba(37, 211, 102, 0.1)',
														},
													}}
													onClick={() =>
														window.open(
															`https://wa.me/${shipData.chartingDepart.whatsAppNumber.replace(/[^0-9]/g, '')}`,
															'_blank'
														)
													}
												>
													<WhatsAppIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</Box>
									)}
									{shipData.chartingDepart.weChatNumber && (
										<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
											<strong>WeChat:</strong>
											<span>{shipData.chartingDepart.weChatNumber}</span>
											<Tooltip title="Open WeChat" arrow>
												<IconButton
													size="small"
													sx={{
														color: '#07C160',
														'&:hover': {
															backgroundColor: 'rgba(7, 193, 96, 0.1)',
														},
													}}
													onClick={() =>
														window.open(`weixin://dl/chat?${shipData.chartingDepart.weChatNumber}`, '_blank')
													}
												>
													<ChatIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</Box>
									)}
								</Box>
							) : (
								<Box sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
									No chartering department information available
								</Box>
							)}
						</Box>
					</Box>

					<Box
						sx={{
							display: 'flex',
							justifyContent: 'flex-end',
							gap: 2,
							mt: 3,
						}}
					>
						<AppButton
							onClick={handlePrintShipDetails}
							value="Print Details"
							variant="contained"
							sx={{
								minWidth: '120px',
								fontWeight: 600,
								borderRadius: '8px',
								textTransform: 'none',
							}}
						/>
						<AppButton
							onClick={handleCloseInfoModal}
							value="Close"
							variant="outlined"
							sx={{
								minWidth: '120px',
								fontWeight: 600,
								borderRadius: '8px',
								textTransform: 'none',
							}}
						/>
					</Box>
				</Box>
			</Modal>
		</>
	);
};

interface ShipsTableProps {
	data: ShipDTO[] | undefined;
	isLoading: boolean;
	selectedPort: string;
	setSelectedPort: (port: string) => void;
	selectedReceiver: string;
	setSelectedReceiver: (receiver: string) => void;
	selectedSubCategory: string;
	setSelectedSubCategory: (subCategory: string) => void;
	selectedCategory: string;
	setSelectedCategory: (category: string) => void;
	dateFrom: Dayjs | null;
	setDateFrom: (date: Dayjs | null) => void;
	dateTo: Dayjs | null;
	setDateTo: (date: Dayjs | null) => void;
	onLastYear: () => void;
	onThisYear: () => void;
	onClearDates: () => void;
	dwtFrom: string;
	setDwtFrom: (value: string) => void;
	dwtTo: string;
	setDwtTo: (value: string) => void;
	showToast: (message: string, severity: 'success' | 'error') => void;
}

export const ShipsTable: FC<ShipsTableProps> = ({
	data,
	isLoading,
	selectedPort,
	setSelectedPort,
	selectedReceiver,
	setSelectedReceiver,
	selectedSubCategory,
	setSelectedSubCategory,
	selectedCategory,
	setSelectedCategory,
	dateFrom,
	setDateFrom,
	dateTo,
	setDateTo,
	onLastYear,
	onThisYear,
	onClearDates,
	dwtFrom,
	setDwtFrom,
	dwtTo,
	setDwtTo,
	showToast,
}) => {
	const t = useTranslation();
	const gridRef = useRef<AgGridReact>(null);


	const shipDtoMap = useMemo(() => {
		const map = new Map<string, ShipDTO>();
		data?.forEach((ship) => map.set(ship.imo, ship));
		return map;
	}, [data]);

	const availablePorts = useMemo(() => {
		const ports = new Set<string>();
		data?.forEach((ship) => {
			if (ship.boardingPort) {
				ports.add(ship.boardingPort);
			}
		});
		return Array.from(ports).sort();
	}, [data]);

	const availableCategories = useMemo(() => {
		const cats = new Set<string>();
		data?.forEach((ship) => {
			ship.cargoes?.forEach((c) => {
				if (c?.category) cats.add(c.category);
			});
		});
		// fallback to constants keys if none found
		if (cats.size === 0) {
			Object.keys(CONSTANTS.CARGAISON_CATEGORIES_AND_SUB_CATEGORIES).forEach((k) => cats.add(k));
		}
		return Array.from(cats).sort();
	}, [data]);

	const availableReceivers = useMemo(() => {
		const receivers = new Set<string>();
		data?.forEach((ship) => {
			ship.cargoes?.forEach((c) => {
				if (c?.receiverName) receivers.add(c.receiverName);
			});
		});
		return Array.from(receivers).sort();
	}, [data]);

	const availableSubCategories = useMemo(() => {
		const subCats = new Set<string>();
		data?.forEach((ship) => {
			ship.cargoes?.forEach((c) => {
				if (c?.subCategory) subCats.add(c.subCategory);
			});
		});
		return Array.from(subCats).sort();
	}, [data]);

	const rowData: ShipRow[] = useMemo(() => {
		let filteredData = data?.map(mapShipDtoToShipRow) ?? [];

		// Only client-side DWT filtering (not available server-side)
		if (dwtFrom || dwtTo) {
			filteredData = filteredData.filter((ship) => {
				const dwtValue = parseFloat(ship.dwt || '0');
				const fromValue = dwtFrom ? parseFloat(dwtFrom) : -Infinity;
				const toValue = dwtTo ? parseFloat(dwtTo) : Infinity;

				return dwtValue >= fromValue && dwtValue <= toValue;
			});
		}

		return filteredData;
	}, [data, dwtFrom, dwtTo]);

	const handlePortFilterChange = (_event: any, newValue: string | null) => {
		setSelectedPort(newValue || '');
	};

	const handleCategoryFilterChange = (_event: any, newValue: string | null) => {
		setSelectedCategory(newValue || '');
	};

	const handleReceiverFilterChange = (_event: any, newValue: string | null) => {
		setSelectedReceiver(newValue || '');
	};

	const handleSubCategoryFilterChange = (_event: any, newValue: string | null) => {
		setSelectedSubCategory(newValue || '');
	};

	const handleDwtFromChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setDwtFrom(event.target.value);
	};

	const handleDwtToChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setDwtTo(event.target.value);
	};

	const exportPdfData = async () => {
		try {
			await addShipService.exportShipsPDF(selectedPort || undefined, undefined, undefined, false);
		} catch (error) {
			console.error('Error exporting PDF:', error);
			showToast('Failed to export PDF. Please try again.', 'error');
		}
	};

	const colDefs: ColDef<ShipRow>[] = useMemo(
		() => [
			{
				field: 'name',
				headerName: t('form.shipName.label'),
				pinned: true,
			},
			{ field: 'imo', headerName: t('form.shipImo.label'), cellRenderer: renderImo },
			{ field: 'dwt', headerName: t('form.dwt.label') },
			{ field: 'cargoType', headerName: 'Cargo Type' },
			{ field: 'cargoCategory', headerName: 'Cargaison Category' },
			{ field: 'agent', headerName: t('form.agent.label'), cellRenderer: renderAgent },
			{ field: 'boardingPort', headerName: t('form.boardingPort.label') },
			{
				field: 'completionDate',
				headerName: t('form.completionDate.label'),
				filter: 'agDateColumnFilter',
				filterParams: dateFilterParams,
				cellRenderer: renderDate,
			},
			{
				headerName: t('common.actions'),
				cellRenderer: renderActions,
				sortable: false,
				filter: false,
				pinned: 'right',
				width: 180,
			},
		],
		[t]
	);

	return (
		<div className={classes('ag-theme-quartz', styles.container)} style={{ height: 650, position: 'relative' }}>
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
					<Box className="loading-spinner" />
				</Box>
			)}
			<Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
				<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
					<LocalizationProvider dateAdapter={AdapterDayjs}>
						<DatePicker
							label="Date From"
							value={dateFrom}
							onChange={(newValue) => setDateFrom(newValue)}
							slotProps={{
								textField: {
									size: 'small',
									sx: { minWidth: 150 },
								},
							}}
						/>
						<DatePicker
							label="Date To"
							value={dateTo}
							onChange={(newValue) => setDateTo(newValue)}
							slotProps={{
								textField: {
									size: 'small',
									sx: { minWidth: 150 },
								},
							}}
						/>
					</LocalizationProvider>

					<ButtonGroup size="small" variant="outlined">
						<Button onClick={onLastYear}>Last Year</Button>
						<Button onClick={onThisYear}>This Year</Button>
						<Button onClick={onClearDates}>Clear</Button>
					</ButtonGroup>
				</Box>

				<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
					<Autocomplete
						size="small"
						options={availableCategories}
						value={selectedCategory || null}
						onChange={handleCategoryFilterChange}
						renderInput={(params) => (
							<TextField {...params} label="Category" placeholder={t('common.search')} />
						)}
						sx={{ minWidth: 150, maxWidth: 300 }}
						noOptionsText={t('common.noOptions')}
						clearText={t('common.clear')}
						openText={t('common.open')}
						closeText={t('common.close')}
					/>
					<Autocomplete
						size="small"
						options={availableReceivers}
						value={selectedReceiver || null}
						onChange={handleReceiverFilterChange}
						renderInput={(params) => (
							<TextField {...params} label="Receiver" placeholder={t('common.search')} />
						)}
						sx={{ minWidth: 200, maxWidth: 300 }}
						noOptionsText={t('common.noOptions')}
						clearText={t('common.clear')}
						openText={t('common.open')}
						closeText={t('common.close')}
					/>
					<Autocomplete
						size="small"
						options={availableSubCategories}
						value={selectedSubCategory || null}
						onChange={handleSubCategoryFilterChange}
						renderInput={(params) => (
							<TextField {...params} label={t('form.subCategory.label')} placeholder={t('common.search')} />
						)}
						sx={{ minWidth: 150, maxWidth: 300 }}
						noOptionsText={t('common.noOptions')}
						clearText={t('common.clear')}
						openText={t('common.open')}
						closeText={t('common.close')}
					/>
					<Autocomplete
						size="small"
						options={availablePorts}
						value={selectedPort || null}
						onChange={handlePortFilterChange}
						renderInput={(params) => (
							<TextField {...params} label={t('form.boardingPort.label')} placeholder={t('common.search')} />
						)}
						sx={{ minWidth: 150, maxWidth: 300 }}
						noOptionsText={t('common.noOptions')}
						clearText={t('common.clear')}
						openText={t('common.open')}
						closeText={t('common.close')}
					/>
					<TextField
						size="small"
						type="number"
						label={t('form.dwt.from')}
						value={dwtFrom}
						onChange={handleDwtFromChange}
						sx={{ minWidth: 100, maxWidth: 150 }}
						inputProps={{ min: 0 }}
					/>
					<TextField
						size="small"
						type="number"
						label={t('form.dwt.to')}
						value={dwtTo}
						onChange={handleDwtToChange}
						sx={{ minWidth: 100, maxWidth: 150 }}
						inputProps={{ min: 0 }}
					/>
					<AppButton
						variant="outlined"
						value={t('common.exportPdf')}
						className={styles.tableExportButton}
						onClick={exportPdfData}
					/>
				</Box>
			</Box>

			<AgGridReact
				ref={gridRef}
				rowData={rowData}
				columnDefs={colDefs}
				defaultColDef={{
					filter: true,
				}}
				columnHoverHighlight
				pagination
				paginationPageSize={20}
				paginationPageSizeSelector={[15, 20, 30, 50, 100]}
				context={{ shipDtoMap, showToast }}
			/>
		</div>
	);
};
