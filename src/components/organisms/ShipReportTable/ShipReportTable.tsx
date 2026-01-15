import { Box, Modal, Snackbar, Alert, IconButton, Autocomplete, TextField } from '@mui/material';
import { ColDef, IDateFilterParams } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css'; // Mandatory CSS required by the grid
import 'ag-grid-community/styles/ag-theme-quartz.css'; // Optional Theme applied to the grid
import { AgGridReact, CustomCellRendererProps } from 'ag-grid-react';
import dayjs from 'dayjs';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { AppButton, DocumentViewer } from '~components/atoms';
import { classes } from '~helpers';
import { useGetAllShips } from '~hooks';
import { useTranslation } from '~i18n';
import { addShipService } from '~services/addShip';
import { ShipDTO } from '~services/addShip/types';
import styles from './ShipReportTable.module.css';
import { ShipReport } from './types';
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
import { useNavigate, useLocation } from 'react-router-dom';
import { isUserAdmin } from '~components/organisms/Layouts/AuthenticatedLayout/AuthenticatedLayout.service';

// Add the ADD_SHIP constant
const ADD_SHIP = 'add-ship';

const mapShipDtoToShipReport = (dto: ShipDTO): ShipReport => {
	const tonnages = dto.cargoes.map((c) => c.tonnage);
	const allNumeric = tonnages.every((t) => !isNaN(Number(t)) && t !== '');

	// Get all unique receiver names
	const allReceivers = dto.cargoes
		.map((c) => c.receiverName)
		.filter((name) => name) // Filter out empty names
		.join(', ');

	// Get all fournisseurs
	const allFournisseurs = [...new Set(dto.cargoes.map((c) => c.fournisseurName).filter((name) => name))] // Filter out empty names and remove duplicates
		.join(', ');

	// Get all unique categories
	const allCategories = [...new Set(dto.cargoes.map((c) => c.category).filter((cat) => cat))].join(', ');

	return {
		name: dto.name,
		imo: dto.imo,
		dwt: dto.dwt,
		boardingPort: dto.boardingPort,
		berthingDate: dto.berthingDate,
		completionDate: dto.completionDate,
		agent: dto.agent || 'NAVLION',
		receiver: allReceivers, // All receivers instead of just first one
		email: '', // Email field removed from ShipPersonnelContact
		phoneNumber: dto.shipOwner?.phoneNumber ?? '',
		fournisseur: allFournisseurs, // All fournisseurs instead of just first one
		cargaison: dto.cargoes.length > 0,
		category: allCategories,
		tonnage: allNumeric ? tonnages.reduce((sum, t) => sum + Number(t), 0).toString() : tonnages.join(', '),
		shipDocuments: dto.shipDocuments,
		charterDocuments: dto.charterDocuments,
		receiverDocuments: dto.receiverDocuments,
	};
};

var dateFilterParams: IDateFilterParams = {
	comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
		const selectedDate = dayjs(filterLocalDateAtMidnight);
		const currentDate = dayjs(cellValue);

		console.group();
		console.log(selectedDate.toISOString());
		console.log(currentDate.toISOString());
		console.groupEnd();

		if (currentDate.isBefore(selectedDate)) {
			return -1;
		}

		if (currentDate.isAfter(selectedDate)) {
			return 1;
		}

		return 0;
	},
};

const renderDate = (data: CustomCellRendererProps<ShipReport>) => {
	return dayjs(data.value).format('DD-MM-YYYY -  HH:mm');
};

// const NON_EXPORTED_COLUMNS = ['shipDocuments', 'charterDocuments', 'receiverDocuments'];

const renderActions = (data: CustomCellRendererProps<ShipReport>) => {
	const t = useTranslation();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [isDeleting, setIsDeleting] = useState(false);
	const [openDeleteModal, setOpenDeleteModal] = useState(false);
	const [openDocumentsModal, setOpenDocumentsModal] = useState(false);
	const [openInfoModal, setOpenInfoModal] = useState(false);

	// We need to get the original Ship DTO data to find the id
	const shipData = data.context.shipDtoMap.get(data.data?.imo);

	if (!shipData) {
		return null;
	}

	const handleDeleteConfirm = async () => {
		try {
			setIsDeleting(true);
			await addShipService.deleteShip(shipData.id);

			// Close the modal first
			setOpenDeleteModal(false);

			// Then invalidate the query
			queryClient.invalidateQueries({ queryKey: [ADD_SHIP] });

			// Show success message via parent toast
			data.context.showToast?.(`Ship ${shipData.name} has been successfully deleted`, 'success');
		} catch (error) {
			console.error('Failed to delete ship:', error);

			// Close the modal
			setOpenDeleteModal(false);

			// Show error toast via parent
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
		// Navigate to update form with the ship ID
		navigate(`/report/update/${shipData.id}`);
	};

	const handleViewDocuments = () => {
		// Open documents modal instead of navigating
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

					{/* Document sections */}
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

					{/* Action buttons */}
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

					{/* Contact Information sections */}
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

					{/* Action buttons */}
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'flex-end',
							mt: 3,
						}}
					>
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

const ShipReportTable: FC = () => {
	const t = useTranslation();
	const gridRef = useRef<AgGridReact>(null);

	// Filter states - moved to top for server-side filtering
	const [selectedPort, setSelectedPort] = useState('');
	const [selectedReceiver, setSelectedReceiver] = useState('');
	const [selectedSubCategory, setSelectedSubCategory] = useState('');
	const [dwtFrom, setDwtFrom] = useState('');
	const [dwtTo, setDwtTo] = useState('');

	// Fetch ships with server-side filtering
	const { data, isError, isLoading } = useGetAllShips({
		boardingPort: selectedPort || undefined,
		receiverName: selectedReceiver || undefined,
		subCategory: selectedSubCategory || undefined,
	});

	if (isError) {
		console.error('[isError] ', isError);
	}

	// Create a Map to store the original ShipDTO by IMO for use in the actions renderer
	const shipDtoMap = useMemo(() => {
		const map = new Map<string, ShipDTO>();
		data?.forEach((ship) => map.set(ship.imo, ship));
		return map;
	}, [data]);

	// Ship details modal state
	const [selectedShip, setSelectedShip] = useState<ShipDTO | null>(null);
	const [shipDetailsModalOpen, setShipDetailsModalOpen] = useState(false);

	// Receiver details modal state
	const [receiverDetailsModalOpen, setReceiverDetailsModalOpen] = useState(false);
	const [receiverDetails, setReceiverDetails] = useState<{ receiverName: string; cargaisons: any[] } | null>(null);

	// Fournisseur details modal state (admin only)
	const [fournisseurDetailsModalOpen, setFournisseurDetailsModalOpen] = useState(false);
	const [fournisseurDetails, setFournisseurDetails] = useState<{ fournisseurName: string; cargaisons: any[] } | null>(
		null
	);

	// Global toast state for this page
	const [toast, setToast] = useState({
		open: false,
		message: '',
		severity: 'success' as 'success' | 'error',
	});
	const handleCloseToast = () => setToast((prev) => ({ ...prev, open: false }));
	const showToast = (message: string, severity: 'success' | 'error') => setToast({ open: true, message, severity });

	// Get available ports and receivers for filter dropdowns (client-side for UI only)
	const availablePorts = useMemo(() => {
		// Get unique ports from data for the select options
		const ports = new Set<string>();
		data?.forEach((ship) => {
			if (ship.boardingPort) {
				ports.add(ship.boardingPort);
			}
		});
		return Array.from(ports).sort();
	}, [data]);

	const availableReceivers = useMemo(() => {
		// Get unique receiver names from all ships' cargoes
		const receivers = new Set<string>();
		data?.forEach((ship) => {
			ship.cargoes.forEach((cargo) => {
				if (cargo.receiverName) {
					receivers.add(cargo.receiverName);
				}
			});
		});
		return Array.from(receivers).sort();
	}, [data]);

	const availableSubCategories = useMemo(() => {
		// Get unique subcategories from all ships' cargoes
		const subCategories = new Set<string>();
		data?.forEach((ship) => {
			ship.cargoes.forEach((cargo) => {
				if (cargo.subCategory) {
					subCategories.add(cargo.subCategory);
				}
			});
		});
		return Array.from(subCategories).sort();
	}, [data]);

	// Map data to row format with client-side DWT range filtering
	const rowData: ShipReport[] = useMemo(() => {
		let filteredData = data?.map(mapShipDtoToShipReport) ?? [];
		
		// Apply DWT range filter client-side
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

	// If navigated here with a toast in location state (e.g., after update), show it once
	const location = useLocation();
	const navigate = useNavigate();
	useEffect(() => {
		const state = location.state as any;
		if (state?.toast) {
			const { message, severity } = state.toast as { message: string; severity: 'success' | 'error' };
			showToast(message, severity);
			// Clear state to avoid duplicate toasts on subsequent renders
			navigate(location.pathname, { replace: true, state: {} });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.state]);

	// Handle double-click on ship name to show details
	const handleShipNameDoubleClick = (shipName: string) => {
		const ship = data?.find((s) => s.name === shipName);
		if (ship) {
			setSelectedShip(ship);
			setShipDetailsModalOpen(true);
		}
	};

	// Handle closing ship details modal
	const handleCloseShipDetailsModal = () => {
		setShipDetailsModalOpen(false);
		setSelectedShip(null);
	};

	// Handle double-click on receiver name to show receiver details
	const handleReceiverDoubleClick = (receiverName: string) => {
		if (!receiverName || !data) return;
		// Gather all cargaisons for this receiver from all ships
		const cargaisons: {
			shipName: string;
			shipImo: string;
			boardingPort: string;
			completionDate: string;
			tonnage: string | number;
			category: string;
			subCategory: string;
			receiverName: string;
			fournisseurName: string;
			provenance: string;
			phoneNumber: string;
		}[] = [];
		data.forEach((ship) => {
			ship.cargoes.forEach((cargo) => {
				if (cargo.receiverName === receiverName) {
					cargaisons.push({
						shipName: ship.name,
						shipImo: ship.imo,
						boardingPort: ship.boardingPort,
						completionDate: ship.completionDate,
						tonnage: cargo.tonnage,
						category: cargo.category,
						subCategory: cargo.subCategory,
						receiverName: cargo.receiverName,
						fournisseurName: cargo.fournisseurName,
						provenance: ship.provenance,
						phoneNumber: cargo.phoneNumber,
					});
				}
			});
		});
		setReceiverDetails({ receiverName, cargaisons });
		receiverDetailsModalOpen || setReceiverDetailsModalOpen(true);
	};

	const handleCloseReceiverDetailsModal = () => {
		setReceiverDetailsModalOpen(false);
		setReceiverDetails(null);
	};

	// Handle double-click on fournisseur name to show fournisseur details (admin only)
	const handleFournisseurDoubleClick = (fournisseurName: string) => {
		if (!fournisseurName || !data) return;
		// Check if user is admin
		if (!isUserAdmin()) {
			showToast('Only admin users can view Fournisseur details', 'error');
			return;
		}
		// Gather all cargaisons for this fournisseur from all ships
		const cargaisons: {
			shipName: string;
			shipImo: string;
			boardingPort: string;
			completionDate: string;
			tonnage: string | number;
			category: string;
			subCategory: string;
			receiverName: string;
			fournisseurName: string;
			provenance: string;
			phoneNumber: string;
		}[] = [];
		data.forEach((ship) => {
			ship.cargoes.forEach((cargo) => {
				if (cargo.fournisseurName === fournisseurName) {
					cargaisons.push({
						shipName: ship.name,
						shipImo: ship.imo,
						boardingPort: ship.boardingPort,
						completionDate: ship.completionDate,
						tonnage: cargo.tonnage,
						category: cargo.category,
						subCategory: cargo.subCategory,
						receiverName: cargo.receiverName,
						fournisseurName: cargo.fournisseurName,
						provenance: ship.provenance,
						phoneNumber: cargo.phoneNumber,
					});
				}
			});
		});
		setFournisseurDetails({ fournisseurName, cargaisons });
		fournisseurDetailsModalOpen || setFournisseurDetailsModalOpen(true);
	};

	const handleCloseFournisseurDetailsModal = () => {
		setFournisseurDetailsModalOpen(false);
		setFournisseurDetails(null);
	};

	const colDefs: ColDef<ShipReport>[] = useMemo(
		() => [
			{
				field: 'name',
				headerName: t('form.shipName.label'),
				pinned: true,
				cellRenderer: (params: CustomCellRendererProps<ShipReport>) => (
					<span
						style={{
							cursor: 'pointer',
							color: '#1976d2',
							textDecoration: 'underline',
						}}
						onDoubleClick={() => handleShipNameDoubleClick(params.value)}
						title="Double-click to view ship details"
					>
						{params.value}
					</span>
				),
			},
			{ field: 'imo', headerName: t('form.shipImo.label') },
			{ field: 'dwt', headerName: t('form.dwt.label') },
			{ field: 'agent', headerName: t('form.agent.label') },
			{ field: 'boardingPort', headerName: t('form.boardingPort.label') },
			// {
			// 	field: 'berthingDate',
			// 	headerName: t('form.BerthingDate.label'),
			// 	filter: 'agDateColumnFilter',
			// 	filterParams: dateFilterParams,
			// 	cellRenderer: renderDate,
			// },
			{
				field: 'completionDate',
				headerName: t('form.completionDate.label'),
				filter: 'agDateColumnFilter',
				filterParams: dateFilterParams,
				cellRenderer: renderDate,
			},
			{
				field: 'receiver',
				headerName: t('common.receiver'),
				cellRenderer: (params: CustomCellRendererProps<ShipReport>) => {
					// Fix: params.data may be undefined, so check before accessing .imo
					// const ship = params.data ? data?.find(s => s.imo === params.data.imo) : undefined;
					// Fix: add type for r in map
					const receivers = (params.value || '')
						.split(',')
						.map((r: string) => r.trim())
						.filter(Boolean);
					return (
						<span>
							{receivers.map((receiver: string, idx: number) => (
								<span
									key={receiver + idx}
									style={{ cursor: 'pointer', color: '#1976d2', textDecoration: 'underline', marginRight: 8 }}
									onDoubleClick={(e) => {
										e.stopPropagation();
										// Fix: handleReceiverDoubleClick expects only receiverName
										handleReceiverDoubleClick(receiver);
									}}
									title={`Double-click to view details for ${receiver}`}
								>
									{receiver}
								</span>
							))}
						</span>
					);
				},
			},
			{ field: 'email', headerName: t('form.email.label') },
			{ field: 'phoneNumber', headerName: t('form.phoneNumber.label') },
			{
				field: 'fournisseur',
				headerName: t('common.fournisseur'),
				cellRenderer: (params: CustomCellRendererProps<ShipReport>) => {
					const isAdmin = isUserAdmin();
					const fournisseurs = (params.value || '')
						.split(',')
						.map((f: string) => f.trim())
						.filter(Boolean);

					if (!isAdmin) {
						// Regular display for non-admin users
						return <span>{params.value || ''}</span>;
					}

					// Clickable display for admin users
					return (
						<span>
							{fournisseurs.map((fournisseur: string, idx: number) => (
								<span
									key={fournisseur + idx}
									style={{ cursor: 'pointer', color: '#1976d2', textDecoration: 'underline', marginRight: 8 }}
									onDoubleClick={(e) => {
										e.stopPropagation();
										handleFournisseurDoubleClick(fournisseur);
									}}
									title={`Double-click to view details for ${fournisseur} (Admin Only)`}
								>
									{fournisseur}
								</span>
							))}
						</span>
					);
				},
			},
			{ field: 'cargaison', headerName: t('common.cargaison') },
			{ field: 'category', headerName: 'Category' },
			{ field: 'tonnage', headerName: t('form.tonnage.label'), filter: 'agNumberColumnFilter' },
			{
				headerName: t('common.actions'),
				cellRenderer: renderActions,
				sortable: false,
				filter: false,
				pinned: 'right',
				width: 180,
			},
		],
		[t, handleShipNameDoubleClick, handleFournisseurDoubleClick, data]
	);

	// const exportCsvData = () => {
	// 	const fileName = [t('common.shipReportExportFilename'), Date.now()].join('-');
	//
	// 	const columnKeys = colDefs
	// 		.map((cd) => cd.field as unknown)
	// 		.filter((field): field is string => {
	// 			console.log(field);
	// 			return typeof field === 'string' && !NON_EXPORTED_COLUMNS.includes(field);
	// 		});
	//
	// 	gridRef.current?.api.exportDataAsCsv({
	// 		fileName,
	// 		columnKeys,
	// 		columnSeparator: ';',
	// 	});
	// };

	const exportPdfData = async () => {
		try {
			// Use the service function to handle PDF export with current filters
			// Pass boardingPort, receiverName, and subCategory filters (if selected) and isFleet=false to export regular ships
			await addShipService.exportShipsPDF(
				selectedPort || undefined,
				selectedReceiver || undefined,
				selectedSubCategory || undefined,
				false
			);
		} catch (error) {
			console.error('Error exporting PDF:', error);
			showToast('Failed to export PDF. Please try again.', 'error');
		}
	};

	return (
		<div className={classes('ag-theme-quartz', styles.container)} style={{ height: 500, position: 'relative' }}>
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
					<Box className="loading-spinner" />
				</Box>
			)}
			<Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'flex-end' }}>
				{/*<AppButton*/}
				{/*	variant="outlined"*/}
				{/*	value={t('common.exportCsv')}*/}
				{/*	className={styles.tableExportButton}*/}
				{/*	onClick={exportCsvData}*/}
				{/*/>*/}
				<Autocomplete
					size="small"
					options={availablePorts}
					value={selectedPort || null}
					onChange={handlePortFilterChange}
					renderInput={(params) => (
						<TextField {...params} label={t('form.boardingPort.label')} placeholder={t('common.search')} />
					)}
					sx={{ minWidth: 150, maxWidth: 300, mr: 1 }}
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
						<TextField {...params} label={t('common.receiver')} placeholder={t('common.search')} />
					)}
					sx={{ minWidth: 150, maxWidth: 300, mr: 1 }}
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
					sx={{ minWidth: 150, maxWidth: 300, mr: 1 }}
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
					sx={{ minWidth: 100, maxWidth: 150, mr: 1 }}
					inputProps={{ min: 0 }}
				/>
				<TextField
					size="small"
					type="number"
					label={t('form.dwt.to')}
					value={dwtTo}
					onChange={handleDwtToChange}
					sx={{ minWidth: 100, maxWidth: 150, mr: 1 }}
					inputProps={{ min: 0 }}
				/>
				<AppButton
					variant="outlined"
					value={t('common.exportPdf')}
					className={styles.tableExportButton}
					onClick={exportPdfData}
				/>
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

			{/* Global Toast notification at top of screen */}
			<Snackbar
				open={toast.open}
				autoHideDuration={3000}
				onClose={handleCloseToast}
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
				sx={{ top: '100px !important', width: '100%', zIndex: 2000 }}
			>
				<Alert
					onClose={handleCloseToast}
					severity={toast.severity}
					variant="filled"
					sx={{
						width: '80%',
						maxWidth: '600px',
						margin: '0 auto',
						boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
						borderRadius: '8px',
						fontSize: '16px',
						padding: '12px 16px',
					}}
				>
					{toast.message}
				</Alert>
			</Snackbar>

			{/* Ship Details Modal */}
			<Modal
				open={shipDetailsModalOpen}
				onClose={handleCloseShipDetailsModal}
				aria-labelledby="ship-details-modal-title"
				aria-describedby="ship-details-modal-description"
			>
				<Box
					sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: 1280,
						bgcolor: 'background.paper',
						borderRadius: '16px',
						boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
						p: 4,
						outline: 'none',
					}}
				>
					{/* Modal content for ship details */}
					{selectedShip && (
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
								gap: 2,
							}}
						>
							<Box
								sx={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
								}}
							>
								<h2
									id="ship-details-modal-title"
									style={{
										margin: 0,
										fontSize: '22px',
										fontWeight: 600,
									}}
								>
									Ship Details
								</h2>
								<IconButton
									onClick={handleCloseShipDetailsModal}
									aria-label="Close"
									size="small"
									sx={{
										color: 'rgba(0, 0, 0, 0.54)',
									}}
								>
									<CloseIcon />
								</IconButton>
							</Box>

							{/* Ship details fields */}
							<Box
								sx={{
									display: 'grid',
									gridTemplateColumns: '1fr 1fr',
									gap: 2,
								}}
							>
								<Box>
									<strong>IMO:</strong> {selectedShip.imo}
								</Box>
								<Box>
									<strong>Ship Name:</strong> {selectedShip.name}
								</Box>
								<Box>
									<strong>Boarding Port:</strong> {selectedShip.boardingPort}
								</Box>
								<Box>
									<strong>Berthing Date:</strong> {dayjs(selectedShip.berthingDate).format('DD-MM-YYYY - HH:mm')}
								</Box>
								<Box>
									<strong>Completion Date:</strong> {dayjs(selectedShip.completionDate).format('DD-MM-YYYY - HH:mm')}
								</Box>
								<Box sx={{ gridColumn: 'span 2' }}>
									<strong>Cargaisons :</strong>
									{selectedShip.cargoes.length > 0 ? (
										<Box sx={{ mt: 1, maxWidth: '100%', overflow: 'auto' }}>
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
															Cargaison
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
															Subcategory
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
														<th
															style={{
																padding: '8px',
																textAlign: 'left',
																backgroundColor: '#f5f5f5',
																borderBottom: '1px solid rgba(224, 224, 224, 1)',
															}}
														>
															Provenance
														</th>
														<th
															style={{
																padding: '8px',
																textAlign: 'left',
																backgroundColor: '#f5f5f5',
																borderBottom: '1px solid rgba(224, 224, 224, 1)',
															}}
														>
															Phone Number
														</th>
													</tr>
												</thead>
												<tbody>
													{selectedShip.cargoes.map((cargo, index) => (
														<tr
															key={index}
															style={{
																backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa',
															}}
														>
															<td
																style={{
																	padding: '8px',
																	borderBottom: '1px solid rgba(224, 224, 224, 1)',
																}}
															>
																Cargaison {index + 1}
															</td>
															<td
																style={{
																	padding: '8px',
																	borderBottom: '1px solid rgba(224, 224, 224, 1)',
																}}
															>
																{cargo.category || 'N/A'}
															</td>
															<td
																style={{
																	padding: '8px',
																	borderBottom: '1px solid rgba(224, 224, 224, 1)',
																}}
															>
																{cargo.subCategory || 'N/A'}
															</td>
															<td
																style={{
																	padding: '8px',
																	borderBottom: '1px solid rgba(224, 224, 224, 1)',
																}}
															>
																{typeof cargo.tonnage === 'number' ? `${cargo.tonnage} TON` : cargo.tonnage || 'N/A'}
															</td>
															<td
																style={{
																	padding: '8px',
																	borderBottom: '1px solid rgba(224, 224, 224, 1)',
																}}
															>
																{cargo.receiverName || 'N/A'}
															</td>
															<td
																style={{
																	padding: '8px',
																	borderBottom: '1px solid rgba(224, 224, 224, 1)',
																}}
															>
																{cargo.fournisseurName || 'N/A'}
															</td>
															<td
																style={{
																	padding: '8px',
																	borderBottom: '1px solid rgba(224, 224, 224, 1)',
																}}
															>
																{selectedShip.provenance || 'N/A'}
															</td>
															<td
																style={{
																	padding: '8px',
																	borderBottom: '1px solid rgba(224, 224, 224, 1)',
																}}
															>
																{cargo.phoneNumber || 'N/A'}
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</Box>
									) : (
										'N/A'
									)}
								</Box>
							</Box>

							{/* Action buttons */}
							<Box
								sx={{
									display: 'flex',
									justifyContent: 'flex-end',
									gap: 2,
									mt: 3,
								}}
							>
								<AppButton
									onClick={handleCloseShipDetailsModal}
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
					)}
				</Box>
			</Modal>

			{/* Receiver Details Modal */}
			<Modal
				open={receiverDetailsModalOpen}
				onClose={handleCloseReceiverDetailsModal}
				aria-labelledby="receiver-details-modal-title"
				aria-describedby="receiver-details-modal-description"
			>
				<Box
					sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: 1100,
						maxHeight: '80vh',
						overflow: 'auto',
						bgcolor: 'background.paper',
						borderRadius: '16px',
						boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
						p: 4,
						outline: 'none',
					}}
				>
					{receiverDetails && (
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<h2 id="receiver-details-modal-title" style={{ margin: 0, fontSize: '22px', fontWeight: 600 }}>
									Receiver Details
								</h2>
								<IconButton
									onClick={handleCloseReceiverDetailsModal}
									aria-label="Close"
									size="small"
									sx={{ color: 'rgba(0, 0, 0, 0.54)' }}
								>
									<CloseIcon />
								</IconButton>
							</Box>
							<Box>
								<strong>Name:</strong> {receiverDetails.receiverName}
							</Box>
							<Box>
								<strong>Total Cargaisons:</strong> {receiverDetails.cargaisons.length}
							</Box>
							<Box>
								<strong>Total Tonnage:</strong>{' '}
								{(() => {
									const totalTonnage = receiverDetails.cargaisons.reduce((sum, cargo) => {
										const tonnage = Number(cargo.tonnage);
										return sum + (isNaN(tonnage) ? 0 : tonnage);
									}, 0);
									return totalTonnage.toLocaleString();
								})()}
							</Box>
							<Box sx={{ mt: 2 }}>
								<h3 style={{ fontSize: '18px', marginTop: 0, marginBottom: '12px' }}>
									Cargaison, {receiverDetails.cargaisons[0]?.subCategory || 'Various'}{' '}
									{(() => {
										const totalTonnage = receiverDetails.cargaisons.reduce((sum, cargo) => {
											const tonnage = Number(cargo.tonnage);
											return sum + (isNaN(tonnage) ? 0 : tonnage);
										}, 0);
										return totalTonnage.toLocaleString();
									})()}
								</h3>
								{receiverDetails.cargaisons.length > 0 ? (
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
													Subcategory
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
												<th
													style={{
														padding: '8px',
														textAlign: 'left',
														backgroundColor: '#f5f5f5',
														borderBottom: '1px solid rgba(224, 224, 224, 1)',
													}}
												>
													Provenance
												</th>
											</tr>
										</thead>
										<tbody>
											{receiverDetails.cargaisons.map((cargo, idx) => (
												<tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
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
													<td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
														{cargo.provenance || 'N/A'}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								) : (
									<Box sx={{ color: 'text.secondary', fontStyle: 'italic' }}>No cargaisons found for this receiver</Box>
								)}
							</Box>
							<Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
								<AppButton
									onClick={handleCloseReceiverDetailsModal}
									value="Close"
									variant="outlined"
									sx={{ minWidth: '120px', fontWeight: 600, borderRadius: '8px', textTransform: 'none' }}
								/>
							</Box>
						</Box>
					)}
				</Box>
			</Modal>

			{/* Fournisseur Details Modal (Admin Only) */}
			<Modal
				open={fournisseurDetailsModalOpen}
				onClose={handleCloseFournisseurDetailsModal}
				aria-labelledby="fournisseur-details-modal-title"
				aria-describedby="fournisseur-details-modal-description"
			>
				<Box
					sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: 1100,
						maxHeight: '80vh',
						overflow: 'auto',
						bgcolor: 'background.paper',
						borderRadius: '16px',
						boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
						p: 4,
						outline: 'none',
					}}
				>
					{fournisseurDetails && (
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<h2 id="fournisseur-details-modal-title" style={{ margin: 0, fontSize: '22px', fontWeight: 600 }}>
									Fournisseur Details (Admin Only)
								</h2>
								<IconButton
									onClick={handleCloseFournisseurDetailsModal}
									aria-label="Close"
									size="small"
									sx={{ color: 'rgba(0, 0, 0, 0.54)' }}
								>
									<CloseIcon />
								</IconButton>
							</Box>
							<Box>
								<strong>Name:</strong> {fournisseurDetails.fournisseurName}
							</Box>
							<Box>
								<strong>Total Cargaisons:</strong> {fournisseurDetails.cargaisons.length}
							</Box>
							<Box>
								<strong>Total Tonnage:</strong>{' '}
								{(() => {
									const totalTonnage = fournisseurDetails.cargaisons.reduce((sum, cargo) => {
										const tonnage = Number(cargo.tonnage);
										return sum + (isNaN(tonnage) ? 0 : tonnage);
									}, 0);
									return totalTonnage.toLocaleString();
								})()}
							</Box>
							<Box sx={{ mt: 2 }}>
								<h3 style={{ fontSize: '18px', marginTop: 0, marginBottom: '12px' }}>
									Cargaison, {fournisseurDetails.cargaisons[0]?.subCategory || 'Various'}{' '}
									{(() => {
										const totalTonnage = fournisseurDetails.cargaisons.reduce((sum, cargo) => {
											const tonnage = Number(cargo.tonnage);
											return sum + (isNaN(tonnage) ? 0 : tonnage);
										}, 0);
										return totalTonnage.toLocaleString();
									})()}
								</h3>
								{fournisseurDetails.cargaisons.length > 0 ? (
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
													Subcategory
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
												<th
													style={{
														padding: '8px',
														textAlign: 'left',
														backgroundColor: '#f5f5f5',
														borderBottom: '1px solid rgba(224, 224, 224, 1)',
													}}
												>
													Provenance
												</th>
											</tr>
										</thead>
										<tbody>
											{fournisseurDetails.cargaisons.map((cargo, idx) => (
												<tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
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
													<td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
														{cargo.provenance || 'N/A'}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								) : (
									<Box sx={{ color: 'text.secondary', fontStyle: 'italic' }}>No cargaisons found for this fournisseur</Box>
								)}
							</Box>
							<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
								<AppButton
									onClick={async () => {
										try {
											// Export PDF for this specific fournisseur's data
											// Note: This would require backend support for fournisseur-specific export
											// For now, showing a message
											showToast('PDF export for Fournisseur coming soon', 'error');
										} catch (error) {
											console.error('Error exporting PDF:', error);
											showToast('Failed to export PDF', 'error');
										}
									}}
									value="Export PDF"
									variant="contained"
									sx={{ minWidth: '120px', fontWeight: 600, borderRadius: '8px', textTransform: 'none' }}
								/>
								<AppButton
									onClick={handleCloseFournisseurDetailsModal}
									value="Close"
									variant="outlined"
									sx={{ minWidth: '120px', fontWeight: 600, borderRadius: '8px', textTransform: 'none' }}
								/>
							</Box>
						</Box>
					)}
				</Box>
			</Modal>
		</div>
	);
};

export { ShipReportTable };
