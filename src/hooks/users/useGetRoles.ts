import { useQuery } from '@tanstack/react-query';
import { IQueryDescriptor } from '~hooks/types';
import { usersService } from '~services/users';
import { RoleDTO } from '~services/users/types';
import { rolesQueryKey } from './key';

export const useGetRoles = (): IQueryDescriptor<RoleDTO[]> => {
	const { data, isPending, isSuccess, isError } = useQuery({
		queryFn: usersService.getRoles,
		queryKey: rolesQueryKey(),
	});

	return { data, isLoading: isPending, isSuccess, isError };
};
