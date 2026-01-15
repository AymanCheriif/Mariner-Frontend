import { apiClient } from '~helpers';
import { CreateUser, UpdateUser } from '~pages';
import { API_ENDPOINTS } from '~services/urls';
import { RoleDTO, UserDTO } from './types';

const createUser = async (createUserRequest: CreateUser): Promise<string> => {
	const { data } = await apiClient.post<string, CreateUser>(API_ENDPOINTS.CreateUser, createUserRequest);

	return data;
};

const updateUser = async (updateUserRequest: UpdateUser): Promise<string> => {
	const { id, ...userData } = updateUserRequest;
	return await apiClient.put<string, UpdateUser>(`${API_ENDPOINTS.UpdateUser}/${id}`, userData);
};

const deleteUser = async (id: string): Promise<void> => {
	await apiClient.delete<void>(`${API_ENDPOINTS.Users}/${id}`);
};

const getUsers = async (): Promise<UserDTO[]> => {
	const data = await apiClient.get<UserDTO[]>(API_ENDPOINTS.Users);

	return data;
};

const getRoles = async (): Promise<RoleDTO[]> => {
	const data = await apiClient.get<RoleDTO[]>(API_ENDPOINTS.Roles);

	return data;
};

export const usersService = {
	createUser,
	updateUser,
	deleteUser,
	getRoles,
	getUsers,
};
