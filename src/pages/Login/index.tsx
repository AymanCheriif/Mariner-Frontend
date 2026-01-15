import { useTranslation } from '~i18n';
import styles from './Login.module.css';

import { LoginForm } from '~components/organisms';
import { IMAGES_PATHS } from '~helpers/constants';

export const LoginPage = () => {
	const t = useTranslation();

	return (
		<div className={styles.wrapper}>
			<div>
				<img src={IMAGES_PATHS.Logo} alt="Logo" width={200} />
			</div>

			<div className={styles.contentContainer}>
				<div className={styles.header}>
					<h5 className={styles.title}>{t('common.login')}</h5>
					<p className={styles.subtitle}>{t('pages.login.subtitle')}</p>
				</div>

				<LoginForm />
			</div>
		</div>
	);
};
