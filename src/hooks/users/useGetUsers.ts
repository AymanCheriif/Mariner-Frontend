import { useQuery } from '@tanstack/react-query';
import { IQueryDescriptor } from '~hooks/types';
import { usersService } from '~services/users';
import { UserDTO } from '~services/users/types';
import { usersQueryKey } from './key';

export const useGetUsers = (): IQueryDescriptor<UserDTO[]> => {
	const { data, isPending, isSuccess, isError } = useQuery({
		queryFn: usersService.getUsers,
		queryKey: usersQueryKey(),
	});

	return { data, isLoading: isPending, isSuccess, isError };
};
