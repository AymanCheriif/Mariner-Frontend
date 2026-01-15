import { useMutation } from '@tanstack/react-query';
import { UseCustomMutation } from '~hooks/types';
import { UpdateUser } from '~pages';
import { usersService } from '~services/users';
import { usersQueryKey } from './key';

export const useUpdateUser: UseCustomMutation<string, UpdateUser> = (onSuccess, onError) => {
	const { data, isPending, mutate, isSuccess, isError } = useMutation({
		mutationFn: usersService.updateUser,
		mutationKey: usersQueryKey(),
		onSuccess,
		onError,
	});

	return { data, isLoading: isPending, mutate, isSuccess, isError };
};
