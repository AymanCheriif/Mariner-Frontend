import { JwtPayload, jwtDecode } from 'jwt-decode';
import { CONSTANTS } from '~helpers/constants';

enum ERole {
	ADMIN = 'ADMIN',
}

interface AppJwtPayload extends JwtPayload {
	id: string;
	email: string;
	roles: string[];
}

export const isUserAdmin = () => {
	const accessToken = localStorage.getItem(CONSTANTS.AccessToken);
	if (accessToken === null) {
		return false;
	}

	try {
		const tokenPayload = jwtDecode<AppJwtPayload>(accessToken);

		return tokenPayload.roles.includes(ERole.ADMIN);
	} catch (err) {
		console.error('[ERROR Decoding Token] ', (err as Error).message);

		return false;
	}
};
