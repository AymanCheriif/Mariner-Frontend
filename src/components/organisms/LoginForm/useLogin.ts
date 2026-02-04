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
	
	// Get saved username if Remember Me was used
	const savedUsername = localStorage.getItem('MARINER_USERNAME') || '';

	const { control, handleSubmit, formState, getValues } = useForm<LoginRequest>({
		defaultValues: {
			...defaultLoginFormValues,
			email: savedUsername,
			isRememberMe: !!savedUsername, // Check Remember Me if username was saved
		},
		resolver: zodResolver(loginSchema),
		mode: 'onBlur',
	});

	const onSuccess = (data: LoginResponse) => {
		console.log('[ACCESS_TOKEN] ', data);
		
		// Get current form values to check Remember Me status
		const formValues = getValues();
		
		// Store token in localStorage if Remember Me is checked, otherwise use sessionStorage
		if (formValues.isRememberMe) {
			localStorage.setItem(CONSTANTS.AccessToken, data.accessToken);
			localStorage.setItem('MARINER_USERNAME', formValues.email);
			// Clear sessionStorage if exists
			sessionStorage.removeItem(CONSTANTS.AccessToken);
		} else {
			sessionStorage.setItem(CONSTANTS.AccessToken, data.accessToken);
			// Clear localStorage if exists
			localStorage.removeItem(CONSTANTS.AccessToken);
			localStorage.removeItem('MARINER_USERNAME');
		}
		
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
