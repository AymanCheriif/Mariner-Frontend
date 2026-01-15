import { FC } from 'react';
import { FormProvider } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { AppButton } from '~components/atoms';
import {
	AddShipDocumentationForm,
	AddShipForm,
	AddTextAreaForm,
	ShipPersonnelContactForm,
} from '~components/organisms';
import { useTranslation } from '~i18n';
import { useAddShip } from '../hooks/useAddShip';
import styles from './AddFleet.module.css';

export const AddFleetPage: FC = () => {
	const t = useTranslation();
	const navigate = useNavigate();

	const handleFleetCreated = (_id: string) => {
		// Redirect to fleets report page after successful creation with success toast
		navigate('/fleets-report', {
			state: {
				toast: {
					message: 'Fleet ship has been successfully added',
					severity: 'success',
				},
			},
		});
	};

	const { onSubmit, formMethods } = useAddShip({ isFleet: true, onCreated: handleFleetCreated });

	return (
		<form className={styles.container} onSubmit={onSubmit}>
			<FormProvider {...formMethods}>
				<AddShipForm isFleet={true} />

				<div className={styles.row}>
					<ShipPersonnelContactForm title={t('common.shipowner')} formName="shipOwner" />
					<ShipPersonnelContactForm title={t('common.operationDepart')} formName="operationDepart" />
					<ShipPersonnelContactForm title={t('common.chartingDepart')} formName="chartingDepart" />
				</div>

				<AddShipDocumentationForm />

				<div className={styles.row}>
					<AddTextAreaForm
						title={t('common.remarksAndFacts')}
						placeholder={t('form.yourNotes.label')}
						formName="remarksAndFacts"
					/>
				</div>

				<div className={styles.submitButtonContainer}>
					<AppButton value={t('common.submit')} type="submit" className={styles.submitButton} />
				</div>
			</FormProvider>
		</form>
	);
};
