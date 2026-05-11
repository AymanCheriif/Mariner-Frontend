import { useQuery } from '@tanstack/react-query';
import { IQueryDescriptor } from '~hooks/types';
import { cargoTaxonomyService } from '~services/cargoTaxonomy';
import { CargoCategoryOptionDTO } from '~services/cargoTaxonomy/types';

export const cargoTaxonomyQueryKey = () => ['cargo-taxonomy'];

export const useGetCargoCategories = (): IQueryDescriptor<CargoCategoryOptionDTO[]> => {
	const { data, isPending, isSuccess, isError } = useQuery({
		queryFn: cargoTaxonomyService.getCargoCategories,
		queryKey: cargoTaxonomyQueryKey(),
		staleTime: 1000 * 60 * 5,
	});

	return { data, isLoading: isPending, isSuccess, isError };
};
