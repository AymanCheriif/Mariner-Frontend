import type { FC } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { EPaths } from '~routes/types';
import { isUserAdmin } from './AuthenticatedLayout.service';

export const AuthenticatedLayout: FC = () => {
	const navigate = useNavigate();

	const isAdmin = isUserAdmin();

	if (!isAdmin) {
		navigate(EPaths.LOGIN);

		return null;
	}

	return <Outlet />;
};
