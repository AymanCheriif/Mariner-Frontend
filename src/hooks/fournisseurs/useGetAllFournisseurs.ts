import { useQuery } from '@tanstack/react-query';
import { IQueryDescriptor } from '~hooks/types';
import { fournisseurService } from '~services/fournisseur';
import { FournisseurSummaryDTO, GetFournisseursFilter } from '~services/fournisseur/types';

const fournisseurQueryKey = () => ['fournisseurs'];

export const useGetAllFournisseurs = (filter?: GetFournisseursFilter): IQueryDescriptor<FournisseurSummaryDTO[]> => {
	const { data, isPending, isSuccess, isError } = useQuery({
		queryFn: () => fournisseurService.getAllFournisseurs(filter),
		queryKey: [...fournisseurQueryKey(), filter],
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	return { data, isLoading: isPending, isSuccess, isError };
};

