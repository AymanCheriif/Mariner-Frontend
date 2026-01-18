import { Box, Modal, IconButton, Autocomplete, TextField } from '@mui/material';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridReact, CustomCellRendererProps } from 'ag-grid-react';
import { FC, useMemo, useRef, useState } from 'react';
import { AppButton } from '~components/atoms';
import { classes } from '~helpers';
import { useTranslation } from '~i18n';
import { API_BASE_URL } from '~services/urls';
import { FournisseurSummaryDTO } from '~services/fournisseur/types';
import styles from './FournisseursTable.module.css';
import CloseIcon from '@mui/icons-material/Close';

interface FournisseurRow {
	fournisseurId: string;
	fournisseurName: string;
	fournisseurEmail: string;
	fournisseurPhoneFixe: string;
	fournisseurPhoneMobile: string;
	totalTonnage: number;
	categories: string;
	subCategories: string;
}

const mapFournisseurToRow = (dto: FournisseurSummaryDTO): FournisseurRow => {
	return {
		fournisseurId: dto.fournisseurId,
		fournisseurName: dto.fournisseurName,
		fournisseurEmail: dto.fournisseurEmail || '',
		fournisseurPhoneFixe: dto.fournisseurPhoneFixe || '',
		fournisseurPhoneMobile: dto.fournisseurPhoneMobile || '',
		totalTonnage: dto.totalTonnage || 0,
		categories: dto.categories?.join(', ') || '',
		subCategories: dto.subCategories?.join(', ') || '',
	};
};

const renderFournisseurName = (data: CustomCellRendererProps<FournisseurRow>) => {
	const [openModal, setOpenModal] = useState(false);
	const fournisseurData = data.context.fournisseurMap.get(data.data?.fournisseurId);

	const handleDoubleClick = () => {
		setOpenModal(true);
	};

	const handleCloseModal = () => {
		setOpenModal(false);
	};

	const handleExportPdf = async () => {
		try {
			const token = localStorage.getItem('ACCESS_TOKEN');
			const url = `${API_BASE_URL}/fournisseurs/${data.data?.fournisseurId}/export-pdf`;

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
			link.download = `fournisseur_${data.data?.fournisseurId}_cargoes.pdf`;
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

	if (!fournisseurData) {
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

			<Modal open={openModal} onClose={handleCloseModal} aria-labelledby="fournisseur-modal-title">
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
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
						<h2 id="fournisseur-modal-title" style={{ margin: 0, fontSize: '22px', fontWeight: 600 }}>
							{fournisseurData.fournisseurName} - Cargoes
						</h2>
						<IconButton onClick={handleCloseModal} aria-label="Close" size="small">
							<CloseIcon />
						</IconButton>
					</Box>

					<Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
						<Box>
							<strong>Total Tonnage:</strong>
							<span style={{ marginLeft: '8px', fontSize: '18px', fontWeight: 600, color: '#1976d2' }}>
								{fournisseurData.totalTonnage.toLocaleString()} MT
							</span>
						</Box>
						<Box sx={{ mt: 1 }}>
							<strong>Total Cargoes:</strong>
							<span style={{ marginLeft: '8px' }}>{fournisseurData.cargoes?.length || 0}</span>
						</Box>
					</Box>

					<Box sx={{ mt: 2 }}>
						{fournisseurData.cargoes && fournisseurData.cargoes.length > 0 ? (
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
											Port
										</th>
										<th style={{ padding: '8px', textAlign: 'left', backgroundColor: '#f5f5f5', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
											Category
										</th>
										<th style={{ padding: '8px', textAlign: 'left', backgroundColor: '#f5f5f5', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
											Sub Category
										</th>
										<th style={{ padding: '8px', textAlign: 'left', backgroundColor: '#f5f5f5', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
											Tonnage
										</th>
										<th style={{ padding: '8px', textAlign: 'left', backgroundColor: '#f5f5f5', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
											Receiver
										</th>
									</tr>
								</thead>
								<tbody>
									{fournisseurData.cargoes.map((cargo: any, idx: number) => (
										<tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
											<td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
												{cargo.shipName || 'N/A'}
											</td>
											<td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
												{cargo.shipImo || 'N/A'}
											</td>
											<td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
												{cargo.boardingPort || 'N/A'}
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
										</tr>
									))}
								</tbody>
							</table>
						) : (
							<Box sx={{ color: 'text.secondary', fontStyle: 'italic' }}>No cargoes available</Box>
						)}
					</Box>

					<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
						<AppButton
							onClick={handleExportPdf}
							value="Export PDF"
							variant="contained"
							sx={{ minWidth: '120px', fontWeight: 600, borderRadius: '8px', textTransform: 'none' }}
						/>
						<AppButton
							onClick={handleCloseModal}
							value="Close"
							variant="outlined"
							sx={{ minWidth: '120px', fontWeight: 600, borderRadius: '8px', textTransform: 'none' }}
						/>
					</Box>
				</Box>
			</Modal>
		</>
	);
};

interface FournisseursTableProps {
	data: FournisseurSummaryDTO[] | undefined;
	isLoading: boolean;
	selectedFournisseur: string;
	setSelectedFournisseur: (fournisseur: string) => void;
	selectedSubCategory: string;
	setSelectedSubCategory: (subCategory: string) => void;
	showToast: (message: string, severity: 'success' | 'error') => void;
}

export const FournisseursTable: FC<FournisseursTableProps> = ({
	data,
	isLoading,
	selectedFournisseur,
	setSelectedFournisseur,
	selectedSubCategory,
	setSelectedSubCategory,
	showToast,
}) => {
	const t = useTranslation();
	const gridRef = useRef<AgGridReact>(null);

	const fournisseurMap = useMemo(() => {
		const map = new Map<string, FournisseurSummaryDTO>();
		data?.forEach((fournisseur) => map.set(fournisseur.fournisseurId, fournisseur));
		return map;
	}, [data]);

	const availableFournisseurs = useMemo(() => {
		return data?.map((f) => f.fournisseurName).sort() || [];
	}, [data]);

	const availableSubCategories = useMemo(() => {
		const subCategories = new Set<string>();
		data?.forEach((fournisseur) => {
			fournisseur.subCategories.forEach((sub) => subCategories.add(sub));
		});
		return Array.from(subCategories).sort();
	}, [data]);

	const rowData: FournisseurRow[] = useMemo(() => {
		return data?.map(mapFournisseurToRow) ?? [];
	}, [data]);

	const handleFournisseurFilterChange = (_event: any, newValue: string | null) => {
		setSelectedFournisseur(newValue || '');
	};

	const handleSubCategoryFilterChange = (_event: any, newValue: string | null) => {
		setSelectedSubCategory(newValue || '');
	};

	const handleExportFilteredPdf = async () => {
		try {
			const token = localStorage.getItem('ACCESS_TOKEN');
			let url = `${API_BASE_URL}/fournisseurs/export-all-pdf`;
			const params = new URLSearchParams();

			if (selectedFournisseur) params.append('fournisseurName', selectedFournisseur);
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
			link.download = `fournisseurs_filtered_${new Date().toISOString().split('T')[0]}.pdf`;
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

	const handlePrintFilteredFournisseurs = async () => {
		try {
			const token = localStorage.getItem('ACCESS_TOKEN');
			let url = `${API_BASE_URL}/fournisseurs/export-all-pdf`;
			const params = new URLSearchParams();

			if (selectedFournisseur) params.append('fournisseurName', selectedFournisseur);
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
			window.open(urlBlob, '_blank');

			showToast('Fournisseurs table opened for printing', 'success');
		} catch (err) {
			console.error('Failed to generate PDF:', err);
			showToast('Failed to generate PDF', 'error');
		}
	};

	const colDefs: ColDef<FournisseurRow>[] = useMemo(
		() => [
			{
				field: 'fournisseurName',
				headerName: 'Fournisseur Name',
				cellRenderer: renderFournisseurName,
				pinned: true,
				width: 250,
			},
			{ field: 'totalTonnage', headerName: 'Total Tonnage', width: 150 },
			{ field: 'categories', headerName: 'Categories', width: 200 },
			{ field: 'subCategories', headerName: 'Sub Categories', width: 200 },
			{ field: 'fournisseurEmail', headerName: 'Email', width: 220 },
			{ field: 'fournisseurPhoneFixe', headerName: 'Phone Fixe', width: 150 },
			{ field: 'fournisseurPhoneMobile', headerName: 'Phone Mobile', width: 150 },
		],
		[]
	);

	return (
		<div className={classes('ag-theme-quartz', styles.container)} style={{ height: 600, position: 'relative' }}>
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

			<Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
				<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
					<Autocomplete
						size="small"
						options={availableFournisseurs}
						value={selectedFournisseur || null}
						onChange={handleFournisseurFilterChange}
						renderInput={(params) => <TextField {...params} label="Fournisseur" placeholder={t('common.search')} />}
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
						renderInput={(params) => <TextField {...params} label={t('form.subCategory.label')} placeholder={t('common.search')} />}
						sx={{ minWidth: 200, maxWidth: 300 }}
						noOptionsText={t('common.noOptions')}
						clearText={t('common.clear')}
						openText={t('common.open')}
						closeText={t('common.close')}
					/>
				</Box>
				<Box sx={{ display: 'flex', gap: 2 }}>
					<AppButton
						onClick={handlePrintFilteredFournisseurs}
						value="Print Table"
						variant="outlined"
						sx={{ minWidth: '120px', fontWeight: 600, borderRadius: '8px', textTransform: 'none' }}
					/>
					<AppButton
						onClick={handleExportFilteredPdf}
						value="Export PDF"
						variant="contained"
						sx={{ minWidth: '120px', fontWeight: 600, borderRadius: '8px', textTransform: 'none' }}
					/>
				</Box>
			</Box>

			<AgGridReact
				ref={gridRef}
				rowData={rowData}
				columnDefs={colDefs}
				defaultColDef={{
					filter: true,
					sortable: true,
					resizable: true,
				}}
				columnHoverHighlight
				pagination
				paginationPageSize={20}
				paginationPageSizeSelector={[15, 20, 30, 50, 100]}
				context={{ fournisseurMap, showToast }}
			/>
		</div>
	);
};

