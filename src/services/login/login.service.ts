import { LoginRequest } from '~components/organisms/LoginForm/loginSchema';
import { apiClient } from '~helpers';
import { API_ENDPOINTS } from '~services/urls';
import type { LoginResponse } from './types';

const getAuthToken = async (loginRequest: LoginRequest): Promise<LoginResponse> => {
	const { data } = await apiClient.post<LoginResponse, LoginRequest>(API_ENDPOINTS.Login, loginRequest);
	return data;
};

export const loginService = {
	getAuthToken,
};
