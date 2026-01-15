import { useQuery } from '@tanstack/react-query';
import { IQueryDescriptor } from '~hooks/types';
import { addShipService } from '~services';
import { GetShipsFilter, ShipDTO } from '~services/addShip/types';
import { addShipQueryKey } from './key';

export const useGetAllShips = (filter?: GetShipsFilter): IQueryDescriptor<ShipDTO[]> => {
	const { data, isPending, isSuccess, isError } = useQuery({
		queryFn: () => addShipService.getShips(filter),
		queryKey: [...addShipQueryKey(), filter], // Include filter in query key for proper caching
	});

	return { data, isLoading: isPending, isSuccess, isError };
};
