import { FC } from 'react';
import { Outlet } from 'react-router-dom';
import { MainHeader, MainSidebar } from '~components/atoms';
import styles from './MainFormLayout.module.css';

interface Props {
	isSidebar?: boolean;
}

export const MainFormLayout: FC<Props> = ({ isSidebar = true }) => {
	return (
		<div className={styles.container}>
			<MainHeader />

			<div className={styles.contentContainer}>
				{isSidebar && <MainSidebar />}

				<div className={styles.mainContentContainer}>
					<Outlet />
				</div>
			</div>
		</div>
	);
};
