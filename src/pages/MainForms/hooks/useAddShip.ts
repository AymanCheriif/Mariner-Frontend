import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useCreateShip } from '~hooks';
import {
	AddOurShipRequest,
	addOurShipSchema,
	addFleetShipFormSchema,
	defaultAddOurShipFormValues,
} from '../AddOurShip/addOurShipSchema';
import { mapShipFormToShipDTO } from './mappers';

interface UseAddShipProps {
	onCreated?: (id: string) => void;
	isFleet?: boolean;
}

export const useAddShip = ({ onCreated, isFleet = false }: UseAddShipProps = {}) => {
	// Use the appropriate schema based on isFleet flag
	const schema = isFleet ? addFleetShipFormSchema : addOurShipSchema;

	const defaultValues = isFleet
		? { ...defaultAddOurShipFormValues, addShip: { ...defaultAddOurShipFormValues.addShip, agent: '' } }
		: defaultAddOurShipFormValues;

	const formMethods = useForm<AddOurShipRequest>({
		defaultValues,
		resolver: zodResolver(schema),
		mode: 'onChange',
	});

	const onSuccess = (id: string) => {
		console.log('[CREATED SHIP] ', id);
		formMethods.reset();
		// Inform caller for toasts, etc.
		onCreated?.(id);
	};

	const onError = (err: unknown) => {
		console.error(err);
	};

	const { mutate, isLoading: isRequestLoading } = useCreateShip(onSuccess, onError);

	const isSubmitDisabled = isRequestLoading || !formMethods.formState.isDirty || !formMethods.formState.isValid;

	const onSubmit: SubmitHandler<AddOurShipRequest> = (data) => {
		console.log('[SUBMIT] ', data);
		const shipDTO = mapShipFormToShipDTO(data);
		// Set isFleet based on the flag
		shipDTO.isFleet = isFleet;
		mutate(shipDTO);
	};

	return { onSubmit: formMethods.handleSubmit(onSubmit), isRequestLoading, isSubmitDisabled, formMethods };
};
