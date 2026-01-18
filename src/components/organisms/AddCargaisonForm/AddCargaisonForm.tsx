import AddIcon from '@mui/icons-material/Add';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { FC, useEffect, useState } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { Autocomplete, TextField } from '@mui/material';
import { AppCard, AppRadio, AppSelect, Input } from '~components/atoms';
import { classes } from '~helpers';
import { CONSTANTS } from '~helpers/constants';
import { useTranslation } from '~i18n';
import { useGetAllFournisseurs } from '~hooks/fournisseurs';
import { useGetAllReceivers } from '~hooks/receivers';
import {
	AddOurShipRequest,
	addCargaisonSchema,
	defaultCargaisonValues,
} from '~pages/MainForms/AddOurShip/addOurShipSchema';
import styles from './AddCargaisonForm.module.css';

interface Props {
	isUpdate?: boolean;
}

const isError = (formState: Record<string, unknown>) => {
	return Object.entries(formState).length > 0;
};

const AVAILABLE_CARGOES_TYPES: { label: string; type: AddOurShipRequest['cargoes'][number]['type'] }[] = [
	{ label: 'container', type: 'container' },
	{ label: 'Cargaison', type: 'cargaison' },
];

type AllowedCategory = keyof typeof CONSTANTS.CARGAISON_CATEGORIES_AND_SUB_CATEGORIES;
const CATEGORIES = Object.keys(CONSTANTS.CARGAISON_CATEGORIES_AND_SUB_CATEGORIES) as AllowedCategory[];

export const AddCargaisonForm: FC<Props> = ({ isUpdate }) => {
	const t = useTranslation();

	const { control, formState, watch, trigger, resetField, setValue } = useFormContext<AddOurShipRequest>();
	const isFormError = isError(formState.errors);

	// Get all receivers for selection
	const { data: receivers = [] } = useGetAllReceivers();

	// Get all fournisseurs for selection
	const { data: fournisseurs = [] } = useGetAllFournisseurs();

	// IMPORTANT: use a custom keyName so our 'id' field from backend is preserved
	const { fields, prepend, remove, replace } = useFieldArray({
		control,
		name: 'cargoes',
		keyName: 'fieldId',
	});

	const cargoes = watch('cargoes');

	// State to track whether each cargo is selecting existing receiver or adding new one
	const [receiverModes, setReceiverModes] = useState<Record<number, 'existing' | 'new'>>({});

	// State to track whether each cargo is selecting existing fournisseur or adding new one
	const [fournisseurModes, setFournisseurModes] = useState<Record<number, 'existing' | 'new'>>({});

	// Sync field array length with form values after form reset/fetch
	useEffect(() => {
		if (Array.isArray(cargoes) && fields.length !== cargoes.length) {
			replace(cargoes as AddOurShipRequest['cargoes']);
		}
	}, [cargoes, fields.length, replace]);

	watch((data, { name, type }) => {
		data.cargoes?.forEach((cargo) => {
			const isTypeChange = type === 'change';
			const isCargoCategoryName = name !== undefined && /^cargoes\.\d+\.category$/.test(name);
			const isCargoSubCategoryDefined = cargo?.subCategory !== undefined && cargo?.subCategory !== '';

			if (isTypeChange && isCargoCategoryName && isCargoSubCategoryDefined) {
				resetField(name.replace('category', 'subCategory') as typeof name);
			}
		});

		return data.cargoes;
	});

	const getSubCategories = (cargoIndex: number) => {
		const category = cargoes[cargoIndex]?.category as AllowedCategory;

		const subCategories = CONSTANTS.CARGAISON_CATEGORIES_AND_SUB_CATEGORIES[category] ?? [];

		return subCategories.length > 0 ? subCategories : [category];
	};

	const handleAddCargo = () => {
		if (formState.errors.cargoes?.length !== undefined && formState.errors.cargoes.length > 0) {
			console.error('[ERRORS] ', formState.errors);
			return;
		}

		const isValid = addCargaisonSchema.safeParse(cargoes[0]).success;
		if (cargoes.length > 0 && !isValid) {
			console.error('[ZOD VALIDATION ERROR] ', cargoes[0]);
			trigger('cargoes.0');
			return;
		}

		let someCargoesAreNotValid = false;

		cargoes.forEach((cargo, index) => {
			if (!addCargaisonSchema.safeParse(cargo).success) {
				console.error(`[ZOD VALIDATION ERROR] `, { index, cargo });
				trigger(`cargoes.${index}`);
				someCargoesAreNotValid = true;
			}
		});

		if (someCargoesAreNotValid) {
			return;
		}

		if (cargoes.length === 0) {
			prepend({ ...defaultCargaisonValues });
			return;
		}

		prepend(defaultCargaisonValues);
	};

	const handleRemoveEntry = (index: number) => {
		remove(index);
	};

	return (
		<AppCard
			title={isUpdate ? `${t('common.update')} ${t('common.cargaison')}(s)` : t('common.addCargaison')}
			icon={<AddIcon className={classes(styles.addIcon, isFormError && styles.disabled)} onClick={handleAddCargo} />}
			isError={isFormError}
		>
			{fields.map((item, index) => {
				return (
					<div key={item.fieldId} className={styles.container} role="group" aria-label={`Cargo ${index + 1}`}>
						{/* Header with delete button */}
						<div className={styles.cargoHeader}>
							<span
								role="button"
								aria-label={`Remove cargo ${index + 1}`}
								tabIndex={0}
								onClick={() => handleRemoveEntry(index)}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										handleRemoveEntry(index);
									}
								}}
							>
								<HighlightOffIcon className={styles.deleteIcon} aria-hidden="true" />
							</span>
							
							<div role="radiogroup" aria-label={t('common.cargaison')}>
								{AVAILABLE_CARGOES_TYPES.map(({ label, type }) => (
									<Controller
										key={`${item.fieldId}.${type}`}
										name={`cargoes.${index}.type`}
										control={control}
										render={({ field: { value, ...field }, fieldState }) => (
											<AppRadio label={label} value={type} checked={value === type} error={fieldState.error} {...field} />
										)}
									/>
								))}
							</div>
						</div>

						{/* Cargo details */}
						<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
							<Controller
								name={`cargoes.${index}.category`}
								control={control}
								render={({ field, fieldState }) => (
									<AppSelect
										muiLabel={t('form.category.label')}
										options={CATEGORIES}
										error={fieldState.error}
										{...field}
									/>
								)}
							/>

							<Controller
								name={`cargoes.${index}.subCategory`}
								control={control}
								render={({ field, fieldState }) => (
									<AppSelect
										muiLabel={t('form.subCategory.label')}
										options={getSubCategories(index)}
										error={fieldState.error}
										{...field}
									/>
								)}
							/>

							<Controller
								name={`cargoes.${index}.tonnage`}
								control={control}
								render={({ field, fieldState }) => (
									<Input muiLabel={t('form.tonnage.label')} error={fieldState.error} {...field} />
								)}
							/>
						</div>

						{/* Receiver Section */}
						<div className={styles.receiverSection}>
							<div className={styles.sectionTitle}>Receiver</div>

							{/* Radio buttons to choose between existing or new receiver */}
							<div className={styles.radioGroup}>
								<AppRadio
									name={`receiverMode-${index}`}
									label="Select existing receiver"
									value="existing"
									checked={receiverModes[index] === 'existing'}
									onChange={(e) => {
										const newModes = { ...receiverModes };
										newModes[index] = e.target.value as 'existing' | 'new';
										setReceiverModes(newModes);
										// Clear receiver fields when switching modes
										setValue(`cargoes.${index}.receiverId`, undefined);
										setValue(`cargoes.${index}.receiverName`, '');
										setValue(`cargoes.${index}.receiverEmail`, '');
										setValue(`cargoes.${index}.receiverPhoneMobile`, '');
										setValue(`cargoes.${index}.receiverMIC`, '');
									}}
								/>
								<AppRadio
									name={`receiverMode-${index}`}
									label="Add new receiver"
									value="new"
									checked={receiverModes[index] === 'new' || receiverModes[index] === undefined}
									onChange={(e) => {
										const newModes = { ...receiverModes };
										newModes[index] = e.target.value as 'existing' | 'new';
										setReceiverModes(newModes);
										// Clear receiver fields when switching modes
										setValue(`cargoes.${index}.receiverId`, undefined);
										setValue(`cargoes.${index}.receiverName`, '');
										setValue(`cargoes.${index}.receiverEmail`, '');
										setValue(`cargoes.${index}.receiverPhoneMobile`, '');
										setValue(`cargoes.${index}.receiverMIC`, '');
									}}
								/>
							</div>

							<div className={styles.receiverFields}>
								{receiverModes[index] === 'existing' ? (
									// Existing receiver selection
									<Controller
										name={`cargoes.${index}.receiverId`}
										control={control}
										render={({ field, fieldState }) => (
											<Autocomplete
												{...field}
												options={receivers}
												getOptionLabel={(option) => option.receiverName || ''}
												renderInput={(params) => (
													<TextField
														{...params}
														label={t('form.receiverName.label')}
														error={!!fieldState.error}
														helperText={fieldState.error?.message}
													/>
												)}
												onChange={(_, value) => {
													field.onChange(value?.receiverId);
													// Auto-fill other fields when selecting existing receiver
													if (value) {
														setValue(`cargoes.${index}.receiverName`, value.receiverName);
														setValue(`cargoes.${index}.receiverEmail`, value.receiverEmail || '');
														setValue(`cargoes.${index}.receiverPhoneMobile`, value.receiverPhoneMobile || '');
														setValue(`cargoes.${index}.receiverMIC`, ''); // MIC not available in summary
													}
												}}
												value={receivers.find(r => r.receiverId === field.value) || null}
											/>
										)}
									/>
								) : (
									// New receiver input fields
									<>
										<Controller
											name={`cargoes.${index}.receiverName`}
											control={control}
											render={({ field, fieldState }) => (
												<Input muiLabel={t('form.receiverName.label')} error={fieldState.error} {...field} />
											)}
										/>

										<Controller
											name={`cargoes.${index}.receiverEmail`}
											control={control}
											render={({ field, fieldState }) => (
												<Input muiLabel={t('form.receiverEmail.label')} error={fieldState.error} {...field} />
											)}
										/>

										<Controller
											name={`cargoes.${index}.receiverPhoneMobile`}
											control={control}
											render={({ field, fieldState }) => (
												<Input
													muiLabel={t('form.phoneMobile.label')}
													error={fieldState.error}
													{...field}
													className={styles.smallField}
												/>
											)}
										/>

										<Controller
											name={`cargoes.${index}.receiverMIC`}
											control={control}
											render={({ field, fieldState }) => (
												<Input
													muiLabel={t('form.mic.label')}
													error={fieldState.error}
													{...field}
													className={styles.smallField}
												/>
											)}
										/>
									</>
								)}
							</div>
						</div>

						{/* Fournisseur Section - Only show for cargaison type */}
						{cargoes[index]?.type === 'cargaison' && (
							<div className={styles.fournisseurSection}>
								<div className={styles.sectionTitle}>Fournisseur</div>

								{/* Radio buttons to choose between existing or new fournisseur */}
								<div className={styles.radioGroup}>
									<AppRadio
										name={`fournisseurMode-${index}`}
										label="Select existing fournisseur"
										value="existing"
										checked={fournisseurModes[index] === 'existing'}
										onChange={(e) => {
											const newModes = { ...fournisseurModes };
											newModes[index] = e.target.value as 'existing' | 'new';
											setFournisseurModes(newModes);
											// Clear fournisseur fields when switching modes
											setValue(`cargoes.${index}.fournisseurId`, undefined);
											setValue(`cargoes.${index}.fournisseurName`, '');
											setValue(`cargoes.${index}.fournisseurEmail`, '');
											setValue(`cargoes.${index}.fournisseurPhoneFixe`, '');
											setValue(`cargoes.${index}.fournisseurPhoneMobile`, '');
											setValue(`cargoes.${index}.fournisseurMIC`, '');
										}}
									/>
									<AppRadio
										name={`fournisseurMode-${index}`}
										label="Add new fournisseur"
										value="new"
										checked={fournisseurModes[index] === 'new' || fournisseurModes[index] === undefined}
										onChange={(e) => {
											const newModes = { ...fournisseurModes };
											newModes[index] = e.target.value as 'existing' | 'new';
											setFournisseurModes(newModes);
											// Clear fournisseur fields when switching modes
											setValue(`cargoes.${index}.fournisseurId`, undefined);
											setValue(`cargoes.${index}.fournisseurName`, '');
											setValue(`cargoes.${index}.fournisseurEmail`, '');
											setValue(`cargoes.${index}.fournisseurPhoneFixe`, '');
											setValue(`cargoes.${index}.fournisseurPhoneMobile`, '');
											setValue(`cargoes.${index}.fournisseurMIC`, '');
										}}
									/>
								</div>

								<div className={styles.fournisseurFields}>
									{fournisseurModes[index] === 'existing' ? (
										// Existing fournisseur selection
										<Controller
											name={`cargoes.${index}.fournisseurId`}
											control={control}
											render={({ field, fieldState }) => (
												<Autocomplete
													{...field}
													options={fournisseurs}
													getOptionLabel={(option) => option.fournisseurName || ''}
													renderInput={(params) => (
														<TextField
															{...params}
															label={t('form.fournisseurName.label')}
															error={!!fieldState.error}
															helperText={fieldState.error?.message}
														/>
													)}
													onChange={(_, value) => {
														field.onChange(value?.fournisseurId);
														// Auto-fill other fields when selecting existing fournisseur
														if (value) {
															setValue(`cargoes.${index}.fournisseurName`, value.fournisseurName);
															setValue(`cargoes.${index}.fournisseurEmail`, value.fournisseurEmail || '');
															setValue(`cargoes.${index}.fournisseurPhoneFixe`, value.fournisseurPhoneFixe || '');
															setValue(`cargoes.${index}.fournisseurPhoneMobile`, value.fournisseurPhoneMobile || '');
															setValue(`cargoes.${index}.fournisseurMIC`, ''); // MIC not available in summary
														}
													}}
													value={fournisseurs.find(f => f.fournisseurId === field.value) || null}
												/>
											)}
										/>
									) : (
										// New fournisseur input fields
										<>
											<Controller
												name={`cargoes.${index}.fournisseurMIC`}
												control={control}
												render={({ field, fieldState }) => (
													<Input
														muiLabel={t('form.mic.label')}
														error={fieldState.error}
														{...field}
														className={styles.fullWidth}
													/>
												)}
											/>

											<Controller
												name={`cargoes.${index}.fournisseurName`}
												control={control}
												render={({ field, fieldState }) => (
													<Input muiLabel={t('form.fournisseurName.label')} error={fieldState.error} {...field} />
												)}
											/>

											<Controller
												name={`cargoes.${index}.fournisseurEmail`}
												control={control}
												render={({ field, fieldState }) => (
													<Input muiLabel={t('form.fournisseurEmail.label')} error={fieldState.error} {...field} />
												)}
											/>

											<Controller
												name={`cargoes.${index}.fournisseurPhoneFixe`}
												control={control}
												render={({ field, fieldState }) => (
													<Input muiLabel={t('form.phoneFixe.label')} error={fieldState.error} {...field} />
												)}
											/>

											<Controller
												name={`cargoes.${index}.fournisseurPhoneMobile`}
												control={control}
												render={({ field, fieldState }) => (
													<Input muiLabel={t('form.phoneMobile.label')} error={fieldState.error} {...field} />
												)}
											/>
										</>
									)}
								</div>
							</div>
						)}

						{/* Legacy fields for backward compatibility */}
						<details style={{ marginTop: '1rem' }}>
							<summary style={{ cursor: 'pointer', color: '#666' }}>Legacy Fields (Deprecated)</summary>
							<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
								<Controller
									name={`cargoes.${index}.phoneNumber`}
									control={control}
									render={({ field, fieldState }) => (
										<Input muiLabel={t('form.phoneNumber.label')} error={fieldState.error} {...field} />
									)}
								/>

								<Controller
									name={`cargoes.${index}.whatsAppNumber`}
									control={control}
									render={({ field, fieldState }) => (
										<Input muiLabel={t('form.whatsAppNumber.label')} error={fieldState.error} {...field} />
									)}
								/>

								<Controller
									name={`cargoes.${index}.email`}
									control={control}
									render={({ field, fieldState }) => (
										<Input muiLabel={t('form.email.label')} error={fieldState.error} {...field} />
									)}
								/>
							</div>
						</details>
					</div>
				);
			})}
		</AppCard>
	);
};
