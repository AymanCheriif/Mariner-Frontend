import { useQuery } from '@tanstack/react-query';
import { IQueryDescriptor } from '~hooks/types';
import { subCategoriesService } from '~services/subcategories';
import { SubCategorySummaryDTO } from '~services/subcategories/types';

const subCategoriesQueryKey = () => ['subcategories'];

export const useGetSubCategorySummaries = (): IQueryDescriptor<SubCategorySummaryDTO[]> => {
	const { data, isPending, isSuccess, isError } = useQuery({
		queryFn: () => subCategoriesService.getSubCategorySummaries(),
		queryKey: subCategoriesQueryKey(),
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	return { data, isLoading: isPending, isSuccess, isError };
};

