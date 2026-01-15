import { useMutation } from '@tanstack/react-query';
import { LoginRequest } from '~components/organisms/LoginForm/loginSchema';
import { UseCustomMutation } from '~hooks/types';
import { loginService } from '~services';
import { LoginResponse } from '~services/login/types';
import { loginQueryKey } from './key';

export const useLoginMutation: UseCustomMutation<LoginResponse, LoginRequest> = (onSuccess) => {
	const { data, isPending, mutate, isSuccess, isError } = useMutation({
		mutationFn: loginService.getAuthToken,
		mutationKey: loginQueryKey(),
		onSuccess,
	});

	return { data, isLoading: isPending, mutate, isSuccess, isError };
};
