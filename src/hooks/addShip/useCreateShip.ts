import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UseCustomMutation } from '~hooks/types';
import { addShipService } from '~services';
import { ShipDTO } from '~services/addShip/types';
import { addShipQueryKey } from './key';

export const useCreateShip: UseCustomMutation<string, ShipDTO> = (onSuccess, onError) => {
	const queryClient = useQueryClient();

	const { data, isPending, mutate, isSuccess, isError } = useMutation({
		mutationFn: addShipService.createShip,
		mutationKey: addShipQueryKey(),
		onSuccess: (response) => {
			// Ensure ships-related queries are refreshed so newly uploaded
			// documents appear in downstream views (e.g. documents modal).
			queryClient.invalidateQueries({ queryKey: addShipQueryKey() });
			onSuccess(response);
		},
		onError,
	});

	return { data, isLoading: isPending, mutate, isSuccess, isError };
};
