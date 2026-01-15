import { useMutation } from '@tanstack/react-query';
import { UseCustomMutation } from '~hooks/types';
import { CreateUser } from '~pages';
import { usersService } from '~services/users';
import { usersQueryKey } from './key';

export const useCreateUser: UseCustomMutation<string, CreateUser> = (onSuccess, onError) => {
	const { data, isPending, mutate, isSuccess, isError } = useMutation({
		mutationFn: usersService.createUser,
		mutationKey: usersQueryKey(),
		onSuccess,
		onError,
	});

	return { data, isLoading: isPending, mutate, isSuccess, isError };
};
