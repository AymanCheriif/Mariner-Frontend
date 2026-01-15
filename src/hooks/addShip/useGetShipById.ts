import { useQuery } from '@tanstack/react-query';
import { IQueryDescriptor } from '~hooks/types';
import { addShipService } from '~services';
import { ShipDTO } from '~services/addShip/types';
import { addShipQueryKey } from './key';

export const useGetShipById = (id?: string): IQueryDescriptor<ShipDTO> => {
  const { data, isPending, isSuccess, isError } = useQuery({
    queryFn: async () => {
      if (!id) throw new Error("Ship ID is required");
      return await addShipService.getShipById(id);
    },
    queryKey: [...addShipQueryKey(), 'details', id],
    enabled: !!id, // Only run the query if we have a ship ID
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  return {
    data,
    isLoading: isPending,
    isSuccess,
    isError
  };
};
