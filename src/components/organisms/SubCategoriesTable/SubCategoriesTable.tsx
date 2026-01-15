import { Box, Modal, IconButton } from '@mui/material';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridReact, CustomCellRendererProps } from 'ag-grid-react';
import { FC, useMemo, useRef, useState } from 'react';
import { AppButton } from '~components/atoms';
import { classes } from '~helpers';
import { SubCategorySummaryDTO } from '~services/subcategories/types';
import styles from './SubCategoriesTable.module.css';
import CloseIcon from '@mui/icons-material/Close';

interface SubCategoryRow {
	subCategory: string;
	totalTonnage: number;
	receiverCount: number;
}

const mapSubCategoryToRow = (dto: SubCategorySummaryDTO): SubCategoryRow => {
	return {
		subCategory: dto.subCategory,
		totalTonnage: dto.totalTonnage,
		receiverCount: dto.receivers.length,
	};
};

const renderSubCategory = (data: CustomCellRendererProps<SubCategoryRow>) => {
	const [openModal, setOpenModal] = useState(false);
	const subCategoryData = data.context.subCategoryMap.get(data.data?.subCategory);

	const handleDoubleClick = () => {
		setOpenModal(true);
	};

	const handleCloseModal = () => {
		setOpenModal(false);
	};

	const handleExportPdf = async () => {
		try {
			const token = localStorage.getItem('ACCESS_TOKEN');
			const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
			const subCategoryEncoded = encodeURIComponent(subCategoryData.subCategory);
			const url = `${API_BASE_URL}/subcategories/${subCategoryEncoded}/export-pdf`;

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
			link.download = `subcategory_${subCategoryData.subCategory.replace(/ /g, '_')}_receivers.pdf`;
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

	if (!subCategoryData) {
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

			<Modal open={openModal} onClose={handleCloseModal} aria-labelledby="subcategory-modal-title">
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
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
						<h2 id="subcategory-modal-title" style={{ margin: 0, fontSize: '22px', fontWeight: 600 }}>
							{subCategoryData.subCategory} - Receivers
						</h2>
						<IconButton onClick={handleCloseModal} aria-label="Close" size="small">
							<CloseIcon />
						</IconButton>
					</Box>

					<Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
						<Box>
							<strong>Total Tonnage:</strong>
							<span style={{ marginLeft: '8px', fontSize: '18px', fontWeight: 600, color: '#1976d2' }}>
								{subCategoryData.totalTonnage.toLocaleString()} MT
							</span>
						</Box>
						<Box sx={{ mt: 1 }}>
							<strong>Total Receivers:</strong>
							<span style={{ marginLeft: '8px' }}>{subCategoryData.receivers.length}</span>
						</Box>
					</Box>

					<Box sx={{ mt: 2 }}>
						{subCategoryData.receivers && subCategoryData.receivers.length > 0 ? (
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
											Receiver Name
										</th>
										<th style={{ padding: '8px', textAlign: 'right', backgroundColor: '#f5f5f5', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
											Tonnage (MT)
										</th>
									</tr>
								</thead>
								<tbody>
									{subCategoryData.receivers.map((receiver: any, idx: number) => (
										<tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
											<td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
												{receiver.receiverName}
											</td>
											<td style={{ padding: '8px', borderBottom: '1px solid rgba(224, 224, 224, 1)', textAlign: 'right' }}>
												{receiver.tonnage.toLocaleString()}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						) : (
							<Box sx={{ color: 'text.secondary', fontStyle: 'italic' }}>No receivers available</Box>
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

interface SubCategoriesTableProps {
	data: SubCategorySummaryDTO[] | undefined;
	isLoading: boolean;
	showToast: (message: string, severity: 'success' | 'error') => void;
}

export const SubCategoriesTable: FC<SubCategoriesTableProps> = ({
	data,
	isLoading,
	showToast,
}) => {
	const gridRef = useRef<AgGridReact>(null);

	const subCategoryMap = useMemo(() => {
		const map = new Map<string, SubCategorySummaryDTO>();
		data?.forEach((subCat) => map.set(subCat.subCategory, subCat));
		return map;
	}, [data]);

	const rowData: SubCategoryRow[] = useMemo(() => {
		return data?.map(mapSubCategoryToRow) ?? [];
	}, [data]);

	const colDefs: ColDef<SubCategoryRow>[] = useMemo(
		() => [
			{
				field: 'subCategory',
				headerName: 'Sub Category',
				cellRenderer: renderSubCategory,
				pinned: true,
				width: 300,
			},
			{
				field: 'totalTonnage',
				headerName: 'Total Tonnage (MT)',
				width: 200,
				valueFormatter: (params) => params.value?.toLocaleString() || '0',
			},
			{
				field: 'receiverCount',
				headerName: 'Number of Receivers',
				width: 200,
			},
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
				context={{ subCategoryMap, showToast }}
			/>
		</div>
	);
};

