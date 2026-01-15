import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { CONSTANTS } from '~helpers/constants';
import { useLoginMutation } from '~hooks/login';
import { EPaths } from '~routes/types';
import { LoginResponse } from '~services/login/types';
import { LoginRequest, defaultLoginFormValues, loginSchema } from './loginSchema';

export const useLogin = () => {
	const navigate = useNavigate();

	const { control, handleSubmit, formState } = useForm<LoginRequest>({
		defaultValues: defaultLoginFormValues,
		resolver: zodResolver(loginSchema),
		mode: 'onBlur',
	});

	const onSuccess = (data: LoginResponse) => {
		console.log('[ACCESS_TOKEN] ', data);
		localStorage.setItem(CONSTANTS.AccessToken, data.accessToken);
		navigate(EPaths.HOME);
	};

	const { mutate, isLoading: isLoginRequestLoading } = useLoginMutation(onSuccess);

	const isSubmitDisabled = isLoginRequestLoading || !formState.isDirty || !formState.isValid;

	const onSubmit: SubmitHandler<LoginRequest> = (data) => {
		console.log('[SUBMIT] ', data);
		mutate(data);
	};

	return { onSubmit: handleSubmit(onSubmit), isLoginRequestLoading, isSubmitDisabled, control };
};
