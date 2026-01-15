import { Divider } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { isUserAdmin } from '~components/organisms/Layouts/AuthenticatedLayout/AuthenticatedLayout.service';
import { classes } from '~helpers/utils';
import { useTranslation } from '~i18n';
import { EPaths } from '~routes/types';
import { AppButton } from '../AppButton';
import { ProfileBadge } from '../ProfileBadge';
import styles from './MainSidebar.module.css';
import { MainFormsNavigationItems } from './constants';

export const MainSidebar = () => {
	const t = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();

	const isAdmin = isUserAdmin();

	const getVariant = (path: string) => {
		return path === location.pathname ? 'contained' : 'outlined';
	};

	const navigateToAdminPage = () => {
		navigate(EPaths.USERS);
	};

	return (
		<div className={styles.sidebar}>
			<div className={styles.content}>
				{MainFormsNavigationItems.map(({ path, textKey }) => {
					return <AppButton key={path} value={t(textKey)} onClick={() => navigate(path)} variant={getVariant(path)} />;
				})}
			</div>

			<div className={styles.content}>
				<AppButton
					value={t('common.report')}
					onClick={() => navigate(EPaths.REPORT)}
					variant={getVariant(EPaths.REPORT)}
				/>

				<AppButton
					value={t('common.fleetsReport')}
					onClick={() => navigate(EPaths.FLEETS_REPORT)}
					variant={getVariant(EPaths.FLEETS_REPORT)}
				/>
			</div>

			<div className={classes(styles.content, styles.center)}>
				{isAdmin && (
					<>
						<AppButton
							className={styles.accountButton}
							variant="text"
							value={t('common.manageUsers')}
							onClick={navigateToAdminPage}
						/>
						<Divider className={styles.divider} />
					</>
				)}
				<ProfileBadge />
			</div>
		</div>
	);
};
