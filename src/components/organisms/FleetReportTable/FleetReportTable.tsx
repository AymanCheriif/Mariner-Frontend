import { Box, Modal, Snackbar, Alert, IconButton, Typography, Autocomplete, TextField } from '@mui/material';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css'; // Mandatory CSS required by the grid
import 'ag-grid-community/styles/ag-theme-quartz.css'; // Optional Theme applied to the grid
import { AgGridReact, CustomCellRendererProps } from 'ag-grid-react';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { AppButton, DocumentViewer } from '~components/atoms';
import { classes } from '~helpers';
import { useTranslation } from '~i18n';
import { addShipService } from '~services/addShip';
import { ShipDTO } from '~services/addShip/types';
import styles from './FleetReportTable.module.css';
import { FleetReport } from './types';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import InfoIcon from '@mui/icons-material/Info';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import ChatIcon from '@mui/icons-material/Chat';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { Tooltip } from '@mui/material';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';

// Add the FLEETS constant
const FLEETS = 'fleets';

const mapShipDtoToFleetReport = (dto: ShipDTO): FleetReport => {
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

	return {
		name: dto.name,
		imo: dto.imo,
		dwt: dto.dwt,
		boardingPort: dto.boardingPort,
		berthingDate: dto.berthingDate,
		receiver: allReceivers, // All receivers instead of just first one
		email: dto.shipOwner?.name ?? '',
		phoneNumber: dto.shipOwner?.phoneNumber ?? '',
		fournisseur: allFournisseurs, // All fournisseurs instead of just first one
		cargaison: dto.cargoes.length > 0,
		tonnage: allNumeric ? tonnages.reduce((sum, t) => sum + Number(t), 0).toString() : tonnages.join(', '),
		shipDocuments: dto.shipDocuments,
		charterDocuments: dto.charterDocuments,
		receiverDocuments: dto.receiverDocuments,
	};
};

const renderActions = (data: CustomCellRendererProps<FleetReport>) => {
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
			queryClient.invalidateQueries({ queryKey: [FLEETS] });

			// Show success message via parent toast
			data.context.showToast?.(`Fleet ship ${shipData.name} has been successfully deleted`, 'success');
		} catch (error) {
			console.error('Failed to delete fleet ship:', error);

			// Close the modal
			setOpenDeleteModal(false);

			// Show error toast via parent
			const msg = `Failed to delete fleet ship: ${error instanceof Error ? error.message : 'Unknown error'}`;
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
								Delete Fleet Ship
							</h2>
							<p
								id="delete-ship-modal-description"
								style={{
									margin: 0,
									color: 'rgba(0, 0, 0, 0.6)',
									fontSize: '16px',
								}}
							>
								Are you sure you want to delete this fleet ship <strong>{shipData.name}</strong>? This action cannot be
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
									{shipData.shipDocuments.map((documentId: string) => (
										<DocumentViewer key={documentId} id={documentId} filename={`${shipData.name}-ship-document`} />
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
									{shipData.charterDocuments.map((documentId: string) => (
										<DocumentViewer key={documentId} id={documentId} filename={`${shipData.name}-charter-document`} />
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
									{shipData.receiverDocuments.map((documentId: string) => (
										<DocumentViewer key={documentId} id={documentId} filename={`${shipData.name}-receiver-document`} />
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

const renderConvertButton = (data: CustomCellRendererProps<FleetReport>) => {
	// Get the original Ship DTO data
	const shipData = data.context.shipDtoMap.get(data.data?.imo);

	if (!shipData) {
		return null;
	}

	return (
		<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
			<button
				onClick={() => data.context.handleOpenConvertModal?.(shipData)}
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: '4px',
					backgroundColor: '#ff9800',
					color: 'white',
					border: 'none',
					borderRadius: '4px',
					padding: '4px 10px',
					fontSize: '11px',
					fontWeight: 500,
					cursor: 'pointer',
					transition: 'all 0.2s ease',
					fontFamily: 'inherit',
				}}
				onMouseOver={(e) => {
					e.currentTarget.style.backgroundColor = '#f57c00';
					e.currentTarget.style.transform = 'translateY(-1px)';
					e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 152, 0, 0.3)';
				}}
				onMouseOut={(e) => {
					e.currentTarget.style.backgroundColor = '#ff9800';
					e.currentTarget.style.transform = 'translateY(0)';
					e.currentTarget.style.boxShadow = 'none';
				}}
			>
				<SwapHorizIcon sx={{ fontSize: '14px' }} />
				<span>Convert</span>
			</button>
		</Box>
	);
};

const FleetReportTable: FC = () => {
	const t = useTranslation();
	const gridRef = useRef<AgGridReact>(null);
	const navigate = useNavigate();
	const location = useLocation();

	// Filter state - moved to top for server-side filtering
	const [selectedPort, setSelectedPort] = useState('');

	// Use custom query to fetch fleets with server-side filtering
	const { data, isError, isLoading } = useQuery({
		queryKey: [FLEETS, { boardingPort: selectedPort || undefined }],
		queryFn: () => addShipService.getFleets({ boardingPort: selectedPort || undefined }),
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

	// Convert modal state
	const [openConvertModal, setOpenConvertModal] = useState(false);
	const [isConverting, setIsConverting] = useState(false);
	const [convertingShip, setConvertingShip] = useState<ShipDTO | null>(null);

	// Global toast state for this page
	const [toast, setToast] = useState({
		open: false,
		message: '',
		severity: 'success' as 'success' | 'error',
	});
	const handleCloseToast = () => setToast((prev) => ({ ...prev, open: false }));
	const showToast = (message: string, severity: 'success' | 'error') => setToast({ open: true, message, severity });

	const handleOpenConvertModal = (shipData: ShipDTO) => {
		setConvertingShip(shipData);
		setOpenConvertModal(true);
	};

	const handleCloseConvertModal = () => {
		setOpenConvertModal(false);
		setConvertingShip(null);
	};

	const handleConvertConfirm = async () => {
		if (!convertingShip || !convertingShip.id) return;

		const shipId = convertingShip.id;
		const shipName = convertingShip.name;

		try {
			setIsConverting(true);

			// Only updating isFleet field - set to false to convert fleet to ship
			// Note: We send the full ship object because the backend PUT endpoint expects it,
			// but only isFleet should actually change. Documents array is empty since we're not uploading any.
			const updatedShip: ShipDTO = {
				...convertingShip,
				isFleet: false,
				documents: [], // Empty array - no document changes needed
			};

			await addShipService.updateShip(shipId, updatedShip);

			// Close modal and reset state
			setOpenConvertModal(false);
			setConvertingShip(null);
			setIsConverting(false);

			// Navigate to update page with success message
			// Use window.location if React Router navigation doesn't work
			const updatePath = `/report/update/${shipId}`;

			// Try React Router navigation first
			try {
				navigate(updatePath, {
					state: {
						toast: {
							message: `Fleet ship ${shipName} converted successfully. Please complete the ship details.`,
							severity: 'success',
						},
					},
				});
			} catch (navError) {
				// Fallback to direct navigation
				console.log('React Router navigation failed, using window.location');
				window.location.href = updatePath;
			}
		} catch (error) {
			console.error('Failed to convert fleet ship:', error);
			const msg = `Failed to convert fleet ship: ${error instanceof Error ? error.message : 'Unknown error'}`;
			showToast(msg, 'error');
			setIsConverting(false);
		}
	};

	// Get available ports for filter dropdown (client-side for UI only)
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

	// Map data to row format (no filtering here - done on server)
	const rowData: FleetReport[] = useMemo(() => data?.map(mapShipDtoToFleetReport) ?? [], [data]);

	const handlePortFilterChange = (_event: any, newValue: string | null) => {
		setSelectedPort(newValue || '');
	};

	// If navigated here with a toast in location state (e.g., after update), show it once
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

	const colDefs: ColDef<FleetReport>[] = useMemo(
		() => [
			{
				field: 'name',
				headerName: t('form.shipName.label'),
				pinned: true,
			},
			{ field: 'imo', headerName: t('form.shipImo.label') },
			{ field: 'dwt', headerName: t('form.dwt.label') },
			{ field: 'boardingPort', headerName: t('form.boardingPort.label') },
			{
				headerName: 'Convert',
				cellRenderer: renderConvertButton,
				sortable: false,
				filter: false,
				width: 110,
			},
			{
				headerName: t('common.actions'),
				cellRenderer: renderActions,
				sortable: false,
				filter: false,
				pinned: 'right',
				width: 150,
			},
		],
		[t]
	);

	const exportPdfData = async () => {
		try {
			// Use the service function to handle PDF export with current filter
			// Pass boardingPort filter (if selected) and isFleet=true to export only fleet ships
			// subCategory is not used for fleets, so pass undefined
			await addShipService.exportShipsPDF(selectedPort || undefined, undefined, undefined, true);
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
				context={{ shipDtoMap, showToast, handleOpenConvertModal }}
			/>{' '}
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
			{/* Convert Fleet to Ship Confirmation Modal */}
			<Modal
				open={openConvertModal}
				onClose={handleCloseConvertModal}
				aria-labelledby="convert-confirmation-modal-title"
				aria-describedby="convert-confirmation-modal-description"
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
					}}
				>
					<Typography
						id="convert-confirmation-modal-title"
						variant="h6"
						sx={{
							mb: 2,
							fontWeight: 600,
							color: '#1a1a1a',
						}}
					>
						Convert Fleet to Ship?
					</Typography>
					<Typography id="convert-confirmation-modal-description" variant="body2" color="text.secondary" sx={{ mb: 3 }}>
						This will convert <strong>{convertingShip?.name}</strong> from a fleet entry to a regular ship. You will be
						redirected to the update page to complete the ship details.
					</Typography>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'flex-end',
							gap: 2,
						}}
					>
						<AppButton
							onClick={handleCloseConvertModal}
							value="Cancel"
							variant="outlined"
							disabled={isConverting}
							sx={{
								minWidth: '100px',
								fontWeight: 600,
								borderRadius: '8px',
								textTransform: 'none',
							}}
						/>
						<AppButton
							onClick={handleConvertConfirm}
							value={isConverting ? 'Converting...' : 'Yes, Convert'}
							variant="contained"
							disabled={isConverting}
							sx={{
								minWidth: '100px',
								fontWeight: 600,
								borderRadius: '8px',
								textTransform: 'none',
								bgcolor: '#ff9800',
								'&:hover': {
									bgcolor: '#f57c00',
								},
							}}
						/>
					</Box>
				</Box>
			</Modal>
		</div>
	);
};

export { FleetReportTable };
