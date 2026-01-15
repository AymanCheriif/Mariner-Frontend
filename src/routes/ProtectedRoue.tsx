import type { FC } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { EPaths } from './types';

interface Props {
	isAuthorized: boolean;
}

export const ProtectedRoute: FC<Props> = ({ isAuthorized }) => {
	return isAuthorized ? <Outlet /> : <Navigate to={EPaths.LOGIN} />;
};
