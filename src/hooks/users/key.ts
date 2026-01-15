const USERS = 'users';
const ROLES = 'roles';

export const usersQueryKey = (...args: unknown[]) => {
	return [USERS, args];
};

export const rolesQueryKey = (...args: unknown[]) => {
	return [ROLES, args];
};
