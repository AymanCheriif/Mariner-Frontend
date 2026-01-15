import { Checkbox, type CheckboxProps } from '@mui/material';

import { forwardRef, useId } from 'react';
import styles from './AppCheckbox.module.css';

interface Props extends CheckboxProps {
	label?: string;
}

export const AppCheckbox = forwardRef<HTMLButtonElement, Props>(({ label, ...props }, ref) => {
	const id = useId();

	return (
		<div className={styles.container}>
			<Checkbox id={id} className={styles.checkbox} {...props} ref={ref} />

			{label && (
				<label htmlFor={id} className={styles.label}>
					{label}
				</label>
			)}
		</div>
	);
});
