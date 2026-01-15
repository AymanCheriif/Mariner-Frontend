import { FC, useState, useEffect } from 'react';
import { Box, Tabs, Tab, Snackbar, Alert } from '@mui/material';
import { ShipsTable, ReceiversTable, FournisseursTable, SubCategoriesTable } from '~components/organisms';
import { useGetAllShips, useGetAllFournisseurs, useGetSubCategorySummaries } from '~hooks';
import { useLocation, useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';

export const ReportPage: FC = () => {
	const [tabValue, setTabValue] = useState(0);
	
	// Filter states
	const [selectedPort, setSelectedPort] = useState('');
	const [selectedReceiver, setSelectedReceiver] = useState('');
	const [selectedSubCategory, setSelectedSubCategory] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('');
	const [dwtFrom, setDwtFrom] = useState('');
	const [dwtTo, setDwtTo] = useState('');
	const [dateFrom, setDateFrom] = useState<Dayjs | null>(null);
	const [dateTo, setDateTo] = useState<Dayjs | null>(null);

	// Fournisseur filter states
	const [selectedFournisseur, setSelectedFournisseur] = useState('');
	const [selectedFournisseurSubCategory, setSelectedFournisseurSubCategory] = useState('');

	// Fetch ships with server-side filtering
	const { data, isError, isLoading } = useGetAllShips({
		boardingPort: selectedPort || undefined,
		receiverName: selectedReceiver || undefined,
		subCategory: selectedSubCategory || undefined,
		category: selectedCategory || undefined,
		dateFrom: dateFrom?.format('YYYY-MM-DD'),
		dateTo: dateTo?.format('YYYY-MM-DD'),
	});

	// Fetch fournisseurs with server-side filtering
	const { data: fournisseursData, isError: isFournisseursError, isLoading: isFournisseursLoading } = useGetAllFournisseurs({
		fournisseurName: selectedFournisseur || undefined,
		subCategory: selectedFournisseurSubCategory || undefined,
	});

	// Fetch sub-category summaries
	const { data: subCategoriesData, isError: isSubCategoriesError, isLoading: isSubCategoriesLoading } = useGetSubCategorySummaries();

	if (isError) {
		console.error('[isError] ', isError);
	}

	if (isFournisseursError) {
		console.error('[isFournisseursError] ', isFournisseursError);
	}

	if (isSubCategoriesError) {
		console.error('[isSubCategoriesError] ', isSubCategoriesError);
	}

	// Global toast state
	const [toast, setToast] = useState({
		open: false,
		message: '',
		severity: 'success' as 'success' | 'error',
	});
	
	const handleCloseToast = () => setToast((prev) => ({ ...prev, open: false }));
	const showToast = (message: string, severity: 'success' | 'error') => setToast({ open: true, message, severity });

	// Handle toast from location state (e.g., after update)
	const location = useLocation();
	const navigate = useNavigate();
	
	useEffect(() => {
		const state = location.state as any;
		if (state?.toast) {
			const { message, severity } = state.toast as { message: string; severity: 'success' | 'error' };
			showToast(message, severity);
			navigate(location.pathname, { replace: true, state: {} });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.state]);

	const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const handleLastYear = () => {
		setDateFrom(dayjs().subtract(1, 'year').startOf('year'));
		setDateTo(dayjs().subtract(1, 'year').endOf('year'));
	};

	const handleThisYear = () => {
		setDateFrom(dayjs().startOf('year'));
		setDateTo(dayjs().endOf('year'));
	};

	const handleClearDates = () => {
		setDateFrom(null);
		setDateTo(null);
	};

	return (
		<Box sx={{ width: '100%' }}>
			<Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
				<Tabs value={tabValue} onChange={handleTabChange} aria-label="report tabs">
					<Tab label="Ships" />
					<Tab label="Receivers" />
					<Tab label="Fournisseurs" />
					<Tab label="Sub-Categories" />
				</Tabs>
			</Box>

			{tabValue === 0 && (
				<ShipsTable
					data={data}
					isLoading={isLoading}
					selectedPort={selectedPort}
					setSelectedPort={setSelectedPort}
					selectedReceiver={selectedReceiver}
					setSelectedReceiver={setSelectedReceiver}
					selectedSubCategory={selectedSubCategory}
					setSelectedSubCategory={setSelectedSubCategory}
					selectedCategory={selectedCategory}
					setSelectedCategory={setSelectedCategory}
					dateFrom={dateFrom}
					setDateFrom={setDateFrom}
					dateTo={dateTo}
					setDateTo={setDateTo}
					onLastYear={handleLastYear}
					onThisYear={handleThisYear}
					onClearDates={handleClearDates}
					dwtFrom={dwtFrom}
					setDwtFrom={setDwtFrom}
					dwtTo={dwtTo}
					setDwtTo={setDwtTo}
					showToast={showToast}
				/>
			)}

			{tabValue === 1 && (
				<ReceiversTable
					selectedReceiver={selectedReceiver}
					setSelectedReceiver={setSelectedReceiver}
					selectedSubCategory={selectedSubCategory}
					setSelectedSubCategory={setSelectedSubCategory}
					showToast={showToast}
				/>
			)}

			{tabValue === 2 && (
				<FournisseursTable
					data={fournisseursData}
					isLoading={isFournisseursLoading}
					selectedFournisseur={selectedFournisseur}
					setSelectedFournisseur={setSelectedFournisseur}
					selectedSubCategory={selectedFournisseurSubCategory}
					setSelectedSubCategory={setSelectedFournisseurSubCategory}
					showToast={showToast}
				/>
			)}

			{tabValue === 3 && (
				<SubCategoriesTable
					data={subCategoriesData}
					isLoading={isSubCategoriesLoading}
					showToast={showToast}
				/>
			)}

			{/* Global Toast notification */}
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
		</Box>
	);
};
