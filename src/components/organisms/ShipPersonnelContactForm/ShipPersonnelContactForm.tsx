import { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { AppCard, Input } from '~components/atoms';
import { useTranslation } from '~i18n';
import { AddOurShipRequest } from '~pages/MainForms/AddOurShip/addOurShipSchema';
import styles from './ShipPersonnelContactForm.module.css';

type AllowedFormNameParentPath = keyof Pick<AddOurShipRequest, 'shipOwner' | 'chartingDepart' | 'operationDepart'>;

interface Props {
	title: string;
	formName: AllowedFormNameParentPath;
}

export const ShipPersonnelContactForm: FC<Props> = ({ title, formName }) => {
	const t = useTranslation();
	const { control, formState } = useFormContext<AddOurShipRequest>();
	const isFormError = formState.errors[formName] !== undefined;

	return (
		<AppCard title={title} isError={isFormError}>
			<Controller
				name={`${formName}.name`}
				control={control}
				defaultValue=""
				render={({ field, fieldState }) => (
					<Input muiLabel={t('form.name.label')} className={styles.input} error={fieldState.error} {...field} value={field.value ?? ''} />
				)}
			/>

			<Controller
				name={`${formName}.phoneNumber`}
				control={control}
				defaultValue=""
				render={({ field, fieldState }) => (
					<Input muiLabel={t('form.phoneNumber.label')} className={styles.input} error={fieldState.error} {...field} value={field.value ?? ''} />
				)}
			/>

			<Controller
				name={`${formName}.whatsAppNumber`}
				control={control}
				defaultValue=""
				render={({ field, fieldState }) => (
					<Input
						muiLabel={t('form.whatsAppNumber.label')}
						className={styles.input}
						error={fieldState.error}
						{...field}
						value={field.value ?? ''}
					/>
				)}
			/>

			<Controller
				name={`${formName}.wechatNumber`}
				control={control}
				defaultValue=""
				render={({ field, fieldState }) => (
					<Input muiLabel={t('form.weChatNumber.label')} className={styles.input} error={fieldState.error} {...field} value={field.value ?? ''} />
				)}
			/>
		</AppCard>
	);
};
