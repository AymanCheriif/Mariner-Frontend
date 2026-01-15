import { FC, PropsWithChildren, ReactNode } from 'react';
import { classes } from '~helpers/utils';
import styles from './AppCard.module.css';

interface Props {
	title?: string;
	icon?: ReactNode;
	isError?: boolean;
	className?: string;
	contentContainerClassName?: string;
}

export const AppCard: FC<PropsWithChildren<Props>> = ({
	title,
	icon,
	isError,
	className,
	contentContainerClassName,
	children,
}) => {
	return (
		<div className={classes(styles.container, className, isError && styles.error)}>
			{title && (
				<div className={styles.header}>
					<h5 className={styles.title}>{title}</h5>
					{icon && icon}
				</div>
			)}

			<div className={classes(styles.contentContainer, contentContainerClassName)}>{children}</div>
		</div>
	);
};
