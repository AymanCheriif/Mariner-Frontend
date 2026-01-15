import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UseCustomMutation } from '~hooks/types';
import { usersService } from '~services/users';
import { usersQueryKey } from './key';

export const useDeleteUser: UseCustomMutation<void, string> = (onSuccess, onError) => {
	const queryClient = useQueryClient();
	const { data, isPending, mutate, isSuccess, isError } = useMutation({
		mutationFn: usersService.deleteUser,
		mutationKey: usersQueryKey(),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: usersQueryKey() });
			onSuccess?.(res as void);
		},
		onError,
	});

	return { data, isLoading: isPending, mutate, isSuccess, isError };
};
