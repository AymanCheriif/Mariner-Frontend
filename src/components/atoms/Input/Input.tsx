import type { TextFieldProps } from '@mui/material';
import { TextField } from '@mui/material';

import { forwardRef, useId } from 'react';
import { classes } from '~helpers/utils';
import { FormInputError } from '~types/utils';
import styles from './Input.module.css';

interface Props extends FormInputError<TextFieldProps> {
	muiLabel?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(
	({ label, muiLabel, placeholder, variant = 'outlined', error, ...props }, ref) => {
		const id = useId();
		const isError = error?.message !== undefined;
		const defaultPlaceholder = placeholder ?? (label as string | undefined) ?? muiLabel;

		return (
			<div className={styles.container}>
				{label && (
					<label htmlFor={id} className={classes(styles.label, isError && styles.error)}>
						{label}
					</label>
				)}

				<TextField
					id={id}
					className={styles.input}
					variant={variant}
					label={muiLabel}
					placeholder={defaultPlaceholder}
					{...props}
					ref={ref}
					error={isError}
					helperText={error?.message}
				/>
			</div>
		);
	}
);
