import { useQuery } from '@tanstack/react-query';
import { receiversService, GetReceiversFilter } from '~services/receivers';

const RECEIVERS_QUERY_KEY = 'receivers';

export const useGetAllReceivers = (filter?: GetReceiversFilter) => {
	return useQuery({
		queryKey: [RECEIVERS_QUERY_KEY, filter],
		queryFn: () => receiversService.getAllReceivers(filter),
		// Prevent stale data issues
		staleTime: 0, // Always consider data stale
		gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
		refetchOnWindowFocus: false, // Don't refetch on window focus
		retry: 2, // Retry failed requests twice
	});
};
