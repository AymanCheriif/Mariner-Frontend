import { FC, useEffect } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { Autocomplete, TextField } from '@mui/material';
import { AppCard, AppDatePicker, AppSelect, Input } from '~components/atoms';
import { CONSTANTS } from '~helpers/constants';
import { classes } from '~helpers/utils';
import { getShipTypeWithCategory } from '~helpers/shipTypes';
import { useTranslation } from '~i18n';
import { AddOurShipRequest } from '~pages/MainForms/AddOurShip/addOurShipSchema';
import styles from './AddShipForm.module.css';

interface Props {
	isAgent?: boolean;
	isUpdate?: boolean;
	isFleet?: boolean; // New prop to determine if this form is used for adding a fleet
}

export const AddShipForm: FC<Props> = ({ isAgent, isUpdate, isFleet = false }) => {
	const t = useTranslation();
	const { control, formState, setValue } = useFormContext<AddOurShipRequest>();

	const isFormError = formState.errors.addShip !== undefined;

	// Show agent field if explicitly requested (isAgent) OR if the form already has an agent value (e.g., update mode)
	const agentValue = useWatch({ control, name: 'addShip.agent' });
	const showAgent = Boolean(isAgent || (isUpdate && agentValue && String(agentValue).trim().length > 0));

	// Automatically set agent to "navlion" when isAgent is true and not in update mode
	useEffect(() => {
		if (isAgent && !isUpdate) {
			setValue('addShip.agent', 'navlion', { shouldDirty: true, shouldValidate: true });
		}
	}, [isAgent, isUpdate, setValue]);

	return (
		<AppCard title={isUpdate ? t('common.updateShip') : t('common.addShip')} isError={isFormError}>
			<div className={styles.row}>
				<Controller
					name="addShip.shipName"
					control={control}
					render={({ field, fieldState }) => (
						<Input muiLabel={t('form.shipName.label')} className={styles.input} error={fieldState.error} {...field} />
					)}
				/>

				<Controller
					name="addShip.shipImo"
					control={control}
					render={({ field, fieldState }) => (
						<Input muiLabel={t('form.shipImo.label')} className={styles.input} error={fieldState.error} {...field} />
					)}
				/>

				<Controller
					name="addShip.dwt"
					control={control}
					render={({ field, fieldState }) => (
						<Input muiLabel={t('form.dwt.label')} className={styles.input} error={fieldState.error} {...field} />
					)}
				/>

				<Controller
					name="addShip.shipType"
					control={control}
					render={({ field, fieldState }) => {
						const shipTypeOptions = getShipTypeWithCategory();
						type ShipTypeOption = (typeof shipTypeOptions)[number];
						
						return (
							<Autocomplete<ShipTypeOption>
								options={shipTypeOptions}
								groupBy={(option) => option.category || ''}
								getOptionLabel={(option) => option.label}
								value={
									field.value
										? shipTypeOptions.find((opt: ShipTypeOption) => opt.value === field.value) || null
										: null
								}
								onChange={(_, newValue) => {
									field.onChange(newValue ? newValue.value : '');
								}}
								isOptionEqualToValue={(option, value) => option.value === value.value}
								renderInput={(params) => (
									<TextField
										{...params}
										label={t('form.shipType.label')}
										error={!!fieldState.error}
										helperText={fieldState.error?.message}
										className={styles.input}
									/>
								)}
							/>
						);
					}}
				/>

				<Controller
					name="addShip.boardingPort"
					control={control}
					render={({ field, fieldState }) => (
						<AppSelect
							muiLabel={t('form.boardingPort.label')}
							className={styles.input}
							options={CONSTANTS.BOARDING_PORTS}
							error={fieldState.error}
							{...field}
						/>
					)}
				/>
			</div>

			{/* Only show date fields, status, and provenance when NOT adding a fleet */}
			{!isFleet && (
				<div className={styles.row}>
					<Controller
						name="addShip.berthingDate"
						control={control}
						render={({ field, fieldState }) => (
							<AppDatePicker muiLabel={t('form.BerthingDate.label')} error={fieldState.error} {...field} />
						)}
					/>

					<Controller
						name="addShip.completionDate"
						control={control}
						render={({ field, fieldState }) => (
							<AppDatePicker muiLabel={t('form.completionDate.label')} error={fieldState.error} {...field} />
						)}
					/>

					<Controller
						name="addShip.shipStatus"
						control={control}
						render={({ field, fieldState }) => (
							<AppSelect
								muiLabel={t('form.shipStatus.label')}
								className={styles.input}
								options={CONSTANTS.SHIP_STATUS}
								error={fieldState.error}
								{...field}
							/>
						)}
					/>

					<Controller
						name="addShip.provenance"
						control={control}
						render={({ field, fieldState }) => (
							<AppSelect
								muiLabel={t('form.provenance.label')}
								className={styles.input}
								options={CONSTANTS.COUNTRIES}
								error={fieldState.error}
								{...field}
							/>
						)}
					/>
				</div>
			)}

			{showAgent && (
				<div className={classes(styles.row, styles.soloRow)}>
					<Controller
						name="addShip.agent"
						control={control}
						render={({ field, fieldState }) => (
							<Input muiLabel={t('form.agent.label')} className={styles.input} error={fieldState.error} {...field} />
						)}
					/>
				</div>
			)}
		</AppCard>
	);
};
