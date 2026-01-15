import { Radio, RadioProps } from '@mui/material';
import { forwardRef, useId } from 'react';
import { classes } from '~helpers';
import { FormInputError } from '~types/utils';
import styles from './AppRadio.module.css';

interface Props extends FormInputError<RadioProps> {
	label: string;
	name: string;
}

export const AppRadio = forwardRef<HTMLButtonElement, Props>(({ label, error, name, ...props }, ref) => {
	const id = useId();
	const isError = error?.message !== undefined;

	return (
		<div className={styles.container}>
			<Radio id={id} name={name} className={styles.radio} {...props} ref={ref} />

			<label htmlFor={id} className={classes(styles.label, isError && styles.error)}>
				{label}
			</label>
		</div>
	);
});
