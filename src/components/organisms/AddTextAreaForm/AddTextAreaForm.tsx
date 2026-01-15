import { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { AppCard, TextArea } from '~components/atoms';
import { AddOurShipRequest } from '~pages/MainForms/AddOurShip/addOurShipSchema';

type AllowedFormNameParentPath = keyof Pick<AddOurShipRequest, 'remarksAndFacts' | 'performanceRate'>;

interface Props {
	title: string;
	placeholder?: string;
	formName: AllowedFormNameParentPath;
}

export const AddTextAreaForm: FC<Props> = ({ title, placeholder, formName }) => {
	const { control, formState } = useFormContext<AddOurShipRequest>();

	const isFormError = formState.errors[formName] !== undefined;

	return (
		<AppCard title={title} isError={isFormError}>
			<Controller
				name={formName}
				control={control}
				render={({ field, fieldState }) => <TextArea placeholder={placeholder} error={fieldState.error} {...field} />}
			/>
		</AppCard>
	);
};
