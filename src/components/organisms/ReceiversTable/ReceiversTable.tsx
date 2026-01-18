import { Box, Autocomplete, TextField, Modal, IconButton, Tooltip } from '@mui/material';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridReact, CustomCellRendererProps } from 'ag-grid-react';
import { FC, useMemo, useRef, useState, useEffect } from 'react';
import { AppButton } from '~components/atoms';
import { classes } from '~helpers';
import { useTranslation } from '~i18n';
import { useGetAllReceivers } from '~hooks/receivers';
import { ReceiverSummaryDTO, CargoDetailsDTO } from '~services/receivers/types';
import styles from './ReceiversTable.module.css';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import { isUserAdmin } from '~components/organisms/Layouts/AuthenticatedLayout/AuthenticatedLayout.service';
import { API_BASE_URL } from '~services/urls';

interface ReceiverRow {
	receiverId: string;
	receiverName: string;
	receiverEmail: string;
	receiverPhoneFixe: string;
	receiverPhoneMobile: string;
	totalCargoes: number;
	totalTonnage: number;
	categories: string;
	subCategories: string;
}

const mapReceiverSummaryToRow = (dto: ReceiverSummaryDTO): ReceiverRow => {
	return {
		receiverId: dto.receiverId,
		receiverName: dto.receiverName,
		receiverEmail: dto.receiverEmail || '',
		receiverPhoneFixe: dto.receiverPhoneFixe || '',
		receiverPhoneMobile: dto.receiverPhoneMobile || '',
		totalCargoes: dto.totalCargoes,
		totalTonnage: dto.totalTonnage,
		categories: dto.categories.join(', '),
		subCategories: dto.subCategories.join(', '),
	};
};

const renderActions = (data: CustomCellRendererProps<ReceiverRow>) => {
	const [openDetailsModal, setOpenDetailsModal] = useState(false);

	const receiverData = data.context.receiverDtoMap.get(data.data?.receiverName);

	if (!receiverData) {
		return null;
	}

	const handleViewDetails = () => {
		setOpenDetailsModal(true);
	};

	const handleCloseDetailsModal = () => {
		setOpenDetailsModal(false);
	};

	const handleExportPdf = async () => {
		try {
			const token = localStorage.getItem('ACCESS_TOKEN');
			const url = `${API_BASE_URL}/receivers/${receiverData.receiverId}/export-pdf`;
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
			link.download = `receiver_${receiverData.receiverId}_cargoes.pdf`;
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(urlBlob);
			if (data.context && data.context.showToast) {
				data.context.showToast('PDF exported successfully', 'success');
			}
		} catch (err) {
			if (data.context && data.context.showToast) {
				data.context.showToast('PDF export failed', 'error');
			}
		}
	};

	return (
		<>
			<Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
				<Tooltip title="View Details" arrow>
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
						onClick={handleViewDetails}
						aria-label="View Details"
					>
						<InfoIcon sx={{ color: '#1976d2', fontSize: '20px' }} />
					</Box>
				</Tooltip>
			</Box>

			{/* Details Modal */}
			<Modal
				open={openDetailsModal}
				onClose={handleCloseDetailsModal}
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
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							mb: 3,
						}}
					>
						<h2
							id="receiver-details-modal-title"
							style={{
								margin: 0,
								fontSize: '22px',
								fontWeight: 600,
							}}
						>
							{receiverData.receiverName} - Cargo Details
						</h2>
						<IconButton
							onClick={handleCloseDetailsModal}
							aria-label="Close"
							size="small"
							sx={{
								color: 'rgba(0, 0, 0, 0.54)',
							}}
						>
							<CloseIcon />
						</IconButton>
					</Box>

					{/* Summary Info */}
					<Box sx={{ mb: 3, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
						<Box>
							<strong>Total Cargoes:</strong> {receiverData.totalCargoes}
						</Box>
						<Box>
							<strong>Total Tonnage:</strong> {receiverData.totalTonnage.toLocaleString()}
						</Box>
						<Box>
							<strong>Categories:</strong> {receiverData.categories.join(', ')}
						</Box>
					</Box>

					{/* Cargo Details Table */}
					<Box sx={{ mt: 2 }}>
						<h3 style={{ fontSize: '18px', marginTop: 0, marginBottom: '12px' }}>All Cargoes</h3>
						{receiverData.cargoes.length > 0 ? (
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
											Ship Name
										</th>
										<th
											style={{
												padding: '8px',
												textAlign: 'left',
												backgroundColor: '#f5f5f5',
												borderBottom: '1px solid rgba(224, 224, 224, 1)',
											}}
										>
											Ship IMO
										</th>
										<th
											style={{
												padding: '8px',
												textAlign: 'left',
												backgroundColor: '#f5f5f5',
												borderBottom: '1px solid rgba(224, 224, 224, 1)',
											}}
										>
											Port
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
											Provenance
										</th>
										{isUserAdmin() && (
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
										)}
									</tr>
								</thead>
								<tbody>
									{receiverData.cargoes.map((cargo: CargoDetailsDTO, idx: number) => (
										<tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
											<td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
												{cargo.shipName}
											</td>
											<td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
												{cargo.shipImo}
											</td>
											<td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
												{cargo.boardingPort}
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
												{cargo.provenance || 'N/A'}
											</td>
											{isUserAdmin() && (
												<td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
													{cargo.fournisseurName || 'N/A'}
												</td>
											)}
										</tr>
									))}
								</tbody>
							</table>
						) : (
							<Box sx={{ color: 'text.secondary', fontStyle: 'italic' }}>No cargo details available</Box>
						)}
					</Box>

					{/* Receiver Documents Section */}
					<Box sx={{ mt: 4 }}>
						<h3 style={{ fontSize: '18px', marginTop: 0, marginBottom: '12px' }}>Receiver Documents</h3>
						{receiverData.cargoes.some((cargo: CargoDetailsDTO) => cargo.receiverDocuments && cargo.receiverDocuments.length > 0) ? (
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
								{receiverData.cargoes.map((cargo: CargoDetailsDTO, idx: number) => {
									if (!cargo.receiverDocuments || cargo.receiverDocuments.length === 0) return null;
									return (
										<Box key={idx} sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
											<Box sx={{ mb: 1 }}>
												<strong>{cargo.shipName}</strong> ({cargo.shipImo})
											</Box>
											<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
												{cargo.receiverDocuments.map((docId: string) => (
													<Box
														key={docId}
														component="a"
														href={`${API_BASE_URL}/documents/${docId}`}
														target="_blank"
														rel="noopener noreferrer"
														sx={{
															display: 'inline-flex',
															alignItems: 'center',
															gap: 0.5,
															p: 1,
															bgcolor: 'white',
															border: '1px solid #ddd',
															borderRadius: 1,
															textDecoration: 'none',
															color: '#1976d2',
															fontSize: '14px',
															'&:hover': {
																bgcolor: '#f5f5f5',
															},
														}}
													>
														<DescriptionIcon fontSize="small" />
														Document {docId.substring(0, 8)}...
													</Box>
												))}
											</Box>
										</Box>
									);
								})}
							</Box>
						) : (
							<Box sx={{ color: 'text.secondary', fontStyle: 'italic', p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
								No receiver documents available for this receiver
							</Box>
						)}
					</Box>

					<Box
						sx={{
							display: 'flex',
							justifyContent: 'flex-end',
							mt: 3,
							gap: 2,
						}}
					>
						<AppButton
							onClick={handleExportPdf}
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
							onClick={handleCloseDetailsModal}
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

interface ReceiversTableProps {
	selectedReceiver: string;
	setSelectedReceiver: (receiver: string) => void;
	selectedSubCategory: string;
	setSelectedSubCategory: (subCategory: string) => void;
	showToast: (message: string, severity: 'success' | 'error') => void;
}

export const ReceiversTable: FC<ReceiversTableProps> = ({
	selectedReceiver,
	setSelectedReceiver,
	selectedSubCategory,
	setSelectedSubCategory,
	showToast,
}) => {
	const t = useTranslation();
	const gridRef = useRef<AgGridReact>(null);
	const [receiverIdSearch, setReceiverIdSearch] = useState('');

	// Fetch ALL receivers (unfiltered) for dropdown options
	const { data: allReceiversData } = useGetAllReceivers({
		receiverName: undefined,
		subCategory: undefined,
	});

	// Fetch FILTERED receivers for table display
	const { data, isError, isLoading, error } = useGetAllReceivers({
		receiverName: selectedReceiver || undefined,
		subCategory: selectedSubCategory || undefined,
	});

	// Show error toast if API fails
	useEffect(() => {
		if (isError && error) {
			console.error('[ReceiversTable] API Error:', error);
			showToast('Failed to load receivers. Please try again.', 'error');
		}
	}, [isError, error, showToast]);

	// Debug logging for filters
	useEffect(() => {
		console.log('[ReceiversTable] Filters changed:', {
			selectedReceiver: selectedReceiver || 'none',
			selectedSubCategory: selectedSubCategory || 'none',
		});
	}, [selectedReceiver, selectedSubCategory]);

	// Debug logging for data
	useEffect(() => {
		if (data) {
			console.log('[ReceiversTable] Data loaded:', {
				count: data.length,
				sample: data.slice(0, 2),
			});
		}
	}, [data]);

	const receiverDtoMap = useMemo(() => {
		const map = new Map<string, ReceiverSummaryDTO>();
		data?.forEach((receiver) => map.set(receiver.receiverName, receiver));
		return map;
	}, [data]);

	const availableReceivers = useMemo(() => {
		// Use allReceiversData (unfiltered) for dropdown options
		return allReceiversData?.map((r) => r.receiverName).sort() || [];
	}, [allReceiversData]);

	const availableSubCategories = useMemo(() => {
		const subCategories = new Set<string>();
		// Use allReceiversData (unfiltered) for dropdown options
		allReceiversData?.forEach((receiver) => {
			receiver.subCategories.forEach((sub) => subCategories.add(sub));
		});
		return Array.from(subCategories).sort();
	}, [allReceiversData]);

	const rowData: ReceiverRow[] = useMemo(() => {
		let rows = data?.map(mapReceiverSummaryToRow) ?? [];
		
		// Client-side filter by receiver ID
		if (receiverIdSearch.trim()) {
			const searchTerm = receiverIdSearch.trim().toUpperCase();
			rows = rows.filter(row => 
				row.receiverId.toUpperCase().includes(searchTerm)
			);
		}
		
		return rows;
	}, [data, receiverIdSearch]);

	const handleReceiverFilterChange = (_event: any, newValue: string | null) => {
		setSelectedReceiver(newValue || '');
	};

	const handleSubCategoryFilterChange = (_event: any, newValue: string | null) => {
		setSelectedSubCategory(newValue || '');
	};

	const handleExportFilteredPdf = async () => {
		try {
			const token = localStorage.getItem('ACCESS_TOKEN');
			let url = `${API_BASE_URL}/receivers/export-all-pdf`;
			const params = new URLSearchParams();

			if (selectedReceiver) params.append('receiverName', selectedReceiver);
			if (selectedSubCategory) params.append('subCategory', selectedSubCategory);
			if (params.toString()) url += '?' + params.toString();

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
			link.download = `receivers_filtered_${new Date().toISOString().split('T')[0]}.pdf`;
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(urlBlob);

			showToast('PDF exported successfully', 'success');
		} catch (err) {
			console.error('Failed to export PDF:', err);
			showToast('Failed to export PDF', 'error');
		}
	};

	const handlePrintFilteredReceivers = async () => {
		try {
			const token = localStorage.getItem('ACCESS_TOKEN');
			let url = `${API_BASE_URL}/receivers/export-all-pdf`;
			const params = new URLSearchParams();

			if (selectedReceiver) params.append('receiverName', selectedReceiver);
			if (selectedSubCategory) params.append('subCategory', selectedSubCategory);
			if (params.toString()) url += '?' + params.toString();

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

			showToast('Receivers table opened for printing', 'success');
		} catch (err) {
			console.error('Failed to generate PDF:', err);
			showToast('Failed to generate PDF', 'error');
		}
	};

	const colDefs: ColDef<ReceiverRow>[] = useMemo(() => {
		const baseCols: ColDef<ReceiverRow>[] = [
			{
				field: 'receiverId',
				headerName: 'Receiver ID',
				pinned: true,
				width: 150,
			},
			{
				field: 'receiverName',
				headerName: t('common.receiver') + ' Name',
				pinned: true,
			},
			{
				field: 'totalTonnage',
				headerName: 'Total Tonnage',
				filter: 'agNumberColumnFilter',
				valueFormatter: (params) => {
					return params.value ? params.value.toLocaleString() : '0';
				},
			},
			{ field: 'categories', headerName: 'Categories' },
			{ field: 'subCategories', headerName: 'Sub Categories' },
			{ field: 'receiverEmail', headerName: 'Email' },
			{ field: 'receiverPhoneFixe', headerName: 'Phone Fixe' },
			{ field: 'receiverPhoneMobile', headerName: 'Phone Mobile' },
			{
				headerName: t('common.actions'),
				cellRenderer: renderActions,
				sortable: false,
				filter: false,
				pinned: 'right',
				width: 100,
			},
		];

		return baseCols;
	}, [t]);

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
			<Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'space-between', alignItems: 'center' }}>
				<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
					<TextField
						size="small"
						label="Receiver ID"
						placeholder="Search by ID..."
						value={receiverIdSearch}
						onChange={(e) => setReceiverIdSearch(e.target.value)}
						sx={{ minWidth: 150, maxWidth: 300 }}
					/>
					<Autocomplete
						size="small"
						options={availableReceivers}
						value={selectedReceiver || null}
						onChange={handleReceiverFilterChange}
						renderInput={(params) => (
							<TextField {...params} label={t('common.receiver')} placeholder={t('common.search')} />
						)}
						sx={{ minWidth: 150, maxWidth: 300 }}
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
				</Box>
				<Box sx={{ display: 'flex', gap: 2 }}>
					<AppButton
						onClick={handlePrintFilteredReceivers}
						value="Print Table"
						variant="outlined"
						sx={{
							minWidth: '120px',
							fontWeight: 600,
							borderRadius: '8px',
							textTransform: 'none',
						}}
					/>
					<AppButton
						onClick={handleExportFilteredPdf}
						value="Export PDF"
						variant="contained"
						sx={{
							minWidth: '120px',
							fontWeight: 600,
							borderRadius: '8px',
							textTransform: 'none',
						}}
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
				context={{ receiverDtoMap, showToast }}
			/>
		</div>
	);
};
