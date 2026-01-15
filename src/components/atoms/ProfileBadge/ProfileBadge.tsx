import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { CONSTANTS } from '~helpers/constants';
import { useTranslation } from '~i18n';
import { EPaths } from '~routes/types';
import { AppButton } from '../AppButton';
import styles from './ProfileBadge.module.css';

export const ProfileBadge: FC = () => {
	const t = useTranslation();
	const navigate = useNavigate();

	const handleLogout = () => {
		localStorage.removeItem(CONSTANTS.AccessToken);
		navigate(EPaths.LOGIN);
	};

	return (
		<div className={styles.avatarContainer}>
			<div className={styles.avatar}>
				<PermIdentityIcon className={styles.icon} />
			</div>

			<AppButton className={styles.logoutButton} variant="text" value={t('common.logout')} onClick={handleLogout} />
		</div>
	);
};
