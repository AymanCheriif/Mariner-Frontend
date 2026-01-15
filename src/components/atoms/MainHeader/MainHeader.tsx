import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import { IconButton } from '@mui/material';
import { IMAGES_PATHS } from '~helpers/constants';
import { ProfileBadge } from '../ProfileBadge';
import styles from './MainHeader.module.css';

export const MainHeader = () => {
	return (
		<div className={styles.header}>
			<div className={styles.logo}>
				<img src={IMAGES_PATHS.Logo} alt="Logo" />
			</div>

			<div className={styles.headerActions}>
				<ProfileBadge />

				<IconButton aria-label="Settings">
					<SettingsIcon />
				</IconButton>

				<IconButton aria-label="Notifications">
					<NotificationsIcon />
				</IconButton>
			</div>
		</div>
	);
};
