const LOGIN = 'login';

export const loginQueryKey = (...args: unknown[]) => {
	return [LOGIN, args];
};
