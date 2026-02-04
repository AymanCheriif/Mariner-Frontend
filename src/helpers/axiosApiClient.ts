import type { AxiosResponse, ResponseType } from 'axios';
import axios from 'axios';
import qs from 'query-string';
import { API_BASE_URL, API_ENDPOINTS } from '~services/urls';
import { CONSTANTS } from './constants';

type ClientRequestConfig = {
	params?: Record<string, unknown>;
	paramsSerializer?: (params: Record<string, any>) => string;
	responseType?: ResponseType;
};

const paramsSerializer = (params: Record<string, unknown>) => qs.stringify(params);

const instance = axios.create({
	baseURL: API_BASE_URL,
	paramsSerializer,
});

instance.interceptors.request.use((config) => {
	// Check both localStorage (Remember Me) and sessionStorage (session only)
	const accessToken = localStorage.getItem(CONSTANTS.AccessToken) || sessionStorage.getItem(CONSTANTS.AccessToken);

	if (accessToken !== null && config.url !== API_ENDPOINTS.Login) {
		config.headers.Authorization = `Bearer ${accessToken}`;
	}

	return config;
});

instance.interceptors.response.use(
	(res) => res,
	(error) => {
		if (axios.isAxiosError(error)) {
			console.error('[AXIOS_ERROR]', error);
		}
		console.error('[UNKNOWN_ERROR]', error);
		// Re-throw the original error so callers can handle it and
		// so we don't lose the response/body information
		throw error;
	}
);

async function get<TData>(path: string, config?: ClientRequestConfig): Promise<TData> {
	const { data } = await instance.get<TData>(path, config);
	return data;
}

async function post<TData, TBody>(
	path: string,
	body?: TBody,
	config?: ClientRequestConfig
): Promise<AxiosResponse<TData>> {
	const data = await instance.post<TData>(path, body, config);
	return data;
}

async function deleteHttpMethod<TData>(path: string, config?: ClientRequestConfig): Promise<TData> {
	const { data } = await instance.delete<TData>(path, config);
	return data;
}

async function put<TData, TBody>(path: string, body?: TBody, config?: ClientRequestConfig): Promise<TData> {
	const { data } = await instance.put<TData>(path, body, config);
	return data;
}

async function patch<TData, TBody>(path: string, body?: TBody, config?: ClientRequestConfig): Promise<TData> {
	const { data } = await instance.patch<TData>(path, body, config);
	return data;
}

export default {
	get,
	post,
	delete: deleteHttpMethod,
	put,
	patch,
};
