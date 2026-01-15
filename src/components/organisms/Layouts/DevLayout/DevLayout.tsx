import type { FC } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppButton } from '~components/atoms';
import { useTranslation } from '~i18n';
import { EPaths, NavigationItem } from '~routes/types';
import styles from './DevLayout.module.css';

const NavigationItems: NavigationItem[] = [
	{ path: EPaths.HOME, textKey: 'common.home' },
	{ path: EPaths.LOGIN, textKey: 'common.login' },
];

const isProd = import.meta.env.PROD;

export const DevLayout: FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const translate = useTranslation();

	if (isProd) {
		return <Outlet />;
	}

	return (
		<>
			<div className={styles.container}>
				<code>Path : {location.pathname}</code>

				<div className={styles.navigation}>
					{NavigationItems.map(({ path, textKey }) => {
						const isActive = (path as string) === location.pathname;
						const variant = isActive ? 'contained' : 'outlined';
						const label = translate(textKey);
						const onNavigate = () => navigate(path);

						return <AppButton key={path} value={label} onClick={onNavigate} variant={variant} />;
					})}
				</div>
			</div>

			<Outlet />
		</>
	);
};
