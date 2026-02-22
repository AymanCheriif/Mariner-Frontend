import { FC, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppButton } from '~components/atoms';
import {
	AddCargaisonForm,
	AddShipDocumentationForm,
	AddShipForm,
	AddTextAreaForm,
	ShipPersonnelContactForm,
	UpdateShipPersonnelContactForm,
} from '~components/organisms';
import { useTranslation } from '~i18n';
import { useAddShip } from '../hooks/useAddShip';
import styles from './AddOurShip.module.css';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { addShipService } from '~services';
import { mapShipDTOToAddOurShipForm, mapShipFormToShipDTO } from '../hooks/mappers';
import {
	defaultAddOurShipFormValues,
	addOurShipSchema,
	addFleetShipFormSchema,
	AddOurShipRequest,
} from './addOurShipSchema';
import { CircularProgress, Snackbar, Alert, Backdrop, Box } from '@mui/material';

export const AddOurShipPage: FC = () => {
	const t = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();
	const { id } = useParams();
	const isUpdateMode = useMemo(() => typeof id === 'string' && id.length > 0, [id]);

	// Track if the ship being updated is a fleet (only affects which form schema/validation is used)
	const [isFleet, setIsFleet] = useState(false);

	// For add mode, use the hook
	const addShipHook = useAddShip({
		onCreated: () => {
			// Show add success toast
			setToast({ open: true, message: 'Ship added successfully', severity: 'success' });
		},
	});

	// For update mode - regular ships
	const updateShipFormMethods = useForm<AddOurShipRequest>({
		defaultValues: defaultAddOurShipFormValues,
		resolver: zodResolver(addOurShipSchema),
		mode: 'onChange',
	});

	// For update mode - fleet ships
	const updateFleetFormMethods = useForm<AddOurShipRequest>({
		defaultValues: defaultAddOurShipFormValues,
		resolver: zodResolver(addFleetShipFormSchema),
		mode: 'onChange',
	});

	// Use the appropriate form methods based on mode and fleet status
	const formMethods = isUpdateMode
		? isFleet
			? updateFleetFormMethods
			: updateShipFormMethods
		: addShipHook.formMethods;
	const isRequestLoading = isUpdateMode ? false : addShipHook.isRequestLoading;

	// Local loading state for update flow (submitting)
	const [isUpdating, setIsUpdating] = useState(false);
	// Prefill loading while fetching ship data to update
	const [isPrefilling, setIsPrefilling] = useState(false);
	// Local toast for add success
	const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
		open: false,
		message: '',
		severity: 'success',
	});
	const handleCloseToast = () => setToast((prev) => ({ ...prev, open: false }));

	// Prefill form when in update mode
	useEffect(() => {
		let cancelled = false;
		(async () => {
			if (!isUpdateMode) return;
			setIsPrefilling(true);
			try {
				const dto = await addShipService.getShipById(id!);
				if (!cancelled) {
					// Track if this is a fleet ship first
					const fleetStatus = dto.isFleet ?? false;
					setIsFleet(fleetStatus);
					// Reset the appropriate form
					const targetForm = fleetStatus ? updateFleetFormMethods : updateShipFormMethods;
					targetForm.reset(mapShipDTOToAddOurShipForm(dto));
				}
			} catch (e) {
				console.error('Failed to load ship', e);
			} finally {
				if (!cancelled) setIsPrefilling(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [id, isUpdateMode, updateShipFormMethods, updateFleetFormMethods]);

	// Reset the form when navigating to '/dashboard' (add mode)
	useEffect(() => {
		if (location.pathname === '/dashboard') {
			formMethods.reset(defaultAddOurShipFormValues);
		}
	}, [location.pathname, formMethods]);

	// Also reset when leaving update mode to add mode (id becomes undefined)
	useEffect(() => {
		if (!isUpdateMode) {
			formMethods.reset(defaultAddOurShipFormValues);
		}
	}, [isUpdateMode, formMethods]);

	// Update submit handler
	const onSubmitUpdate = formMethods.handleSubmit(async (data) => {
		try {
			setIsUpdating(true);
			const shipDTO = mapShipFormToShipDTO(data);
			// Preserve the isFleet flag from the original ship data
			shipDTO.isFleet = isFleet;
			await addShipService.updateShip(id!, shipDTO);
			// Navigate back to the appropriate report page with success toast state
			const targetPage = isFleet ? '/fleets-report' : '/report';
			const successMessage = isFleet ? 'Fleet ship updated successfully' : 'Ship updated successfully';
			navigate(targetPage, { state: { toast: { message: successMessage, severity: 'success' } } });
		} catch (e) {
			console.error('Failed to update ship', e);
		} finally {
			setIsUpdating(false);
		}
	});

	const isPrimaryLoading = isUpdateMode ? isUpdating : isRequestLoading;
	const primaryLabel = isUpdateMode
		? isUpdating
			? 'Updating...'
			: t('common.update')
		: isRequestLoading
			? 'Adding...'
			: t('common.submit');
	// const primaryDisabled = isUpdateMode
	// 	? isUpdating || !formMethods.formState.isValid || !formMethods.formState.isDirty
	// 	: isSubmitDisabled;

	return (
		<form className={styles.container} onSubmit={isUpdateMode ? onSubmitUpdate : addShipHook.onSubmit}>
			<FormProvider {...formMethods}>
				{/* Loading overlay during prefill in update mode */}
				<Backdrop open={isPrefilling} sx={{ zIndex: 2000, color: '#fff' }}>
					<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
						<CircularProgress color="inherit" />
						<span style={{ fontWeight: 600 }}>Loading ship…</span>
					</Box>
				</Backdrop>

				<AddShipForm isUpdate={isUpdateMode} />

				<AddCargaisonForm isUpdate={isUpdateMode} />

				<div className={styles.row}>
					{isUpdateMode ? (
						<UpdateShipPersonnelContactForm title={t('common.shipowner')} formName="shipOwner" />
					) : (
						<ShipPersonnelContactForm title={t('common.shipowner')} formName="shipOwner" />
					)}
					{isUpdateMode ? (
						<UpdateShipPersonnelContactForm title={t('common.operationDepart')} formName="operationDepart" />
					) : (
						<ShipPersonnelContactForm title={t('common.operationDepart')} formName="operationDepart" />
					)}
					{isUpdateMode ? (
						<UpdateShipPersonnelContactForm title={t('common.chartingDepart')} formName="chartingDepart" />
					) : (
						<ShipPersonnelContactForm title={t('common.chartingDepart')} formName="chartingDepart" />
					)}
				</div>

				<AddShipDocumentationForm />

				<div className={styles.row}>
					<AddTextAreaForm
						title={t('common.remarksAndFacts')}
						placeholder={t('form.yourNotes.label')}
						formName="remarksAndFacts"
					/>
					<AddTextAreaForm
						title={t('common.performanceRate')}
						placeholder={t('form.performanceRateFunction')}
						formName="performanceRate"
					/>
				</div>

				<div className={styles.submitButtonContainer}>
					{isUpdateMode && (
						<AppButton
							value={t('common.cancel')}
							variant="outlined"
							type="button"
							onClick={() => navigate(isFleet ? '/fleets-report' : '/report')}
						/>
					)}
					<AppButton
						value={primaryLabel}
						type="submit"
						className={styles.submitButton}
						startIcon={isPrimaryLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
						style={!isUpdateMode ? { marginLeft: 'auto' } : { marginRight: 0 }}
					/>
				</div>

				{/* Global Toast notification at top of screen for add success */}
				<Snackbar
					open={toast.open}
					autoHideDuration={3000}
					onClose={handleCloseToast}
					anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
					sx={{ top: '0px !important', width: '100%', zIndex: 2000 }}
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
			</FormProvider>
		</form>
	);
};
