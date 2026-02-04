import { FC } from 'react';
import { FormProvider } from 'react-hook-form';
import { AppButton } from '~components/atoms';
import {
	AddCargaisonForm,
	AddShipDocumentationForm,
	AddShipForm,
	AddTextAreaForm,
	ShipPersonnelContactForm,
} from '~components/organisms';
import { useTranslation } from '~i18n';
import { useAddShip } from '../hooks/useAddShip';
import styles from './AddAgentShip.module.css';

export const AddAgentShipPage: FC = () => {
	const t = useTranslation();
	const { onSubmit, formMethods } = useAddShip({ isFleet: true });

	return (
		<form className={styles.container} onSubmit={onSubmit}>
			<FormProvider {...formMethods}>
				<AddShipForm isAgent />

				<AddCargaisonForm />

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
					<AddTextAreaForm
						title={t('common.performanceRate')}
						placeholder={t('form.performanceRateFunction')}
						formName="performanceRate"
					/>
				</div>

				<div className={styles.submitButtonContainer}>
					<AppButton value={t('common.submit')} type="submit" className={styles.submitButton} />
				</div>
			</FormProvider>
		</form>
	);
};
