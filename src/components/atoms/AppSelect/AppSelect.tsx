import { FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectProps } from '@mui/material';
import { forwardRef } from 'react';
import { z } from 'zod';
import { FormInputError } from '~types/utils';
import styles from './AppSelect.module.css';

type SelectOptions = z.infer<typeof optionsSchema>;
interface Props extends FormInputError<SelectProps> {
	muiLabel?: string;
	options?: string[] | SelectOptions;
	select?: true;
}

export const AppSelect = forwardRef<HTMLInputElement, Props>(
	({ muiLabel, label, variant, error, placeholder, options, ...props }, ref) => {
		const isError = error?.message !== undefined;
		const defaultPlaceholder = placeholder ?? (label as string | undefined) ?? muiLabel;

		return (
			<div className={styles.container}>
				<FormControl sx={{ m: 1, minWidth: 120 }} error={isError} className={styles.formControl}>
					<InputLabel>{muiLabel}</InputLabel>
					<Select
						className={styles.input}
						variant={variant}
						label={muiLabel}
						placeholder={defaultPlaceholder}
						{...props}
						ref={ref}
						error={isError}
						MenuProps={{ sx: { maxHeight: 500 } }}
					>
						{isSelectOptions(options)
							? options.map(({ label, value }) => (
									<MenuItem value={value} key={value}>
										{label}
									</MenuItem>
								))
							: options?.map((key) => (
									<MenuItem value={key} key={key}>
										{key}
									</MenuItem>
								))}
					</Select>
					<FormHelperText>{error?.message}</FormHelperText>
				</FormControl>
			</div>
		);
	}
);

const optionsSchema = z.array(
	z.object({
		label: z.string(),
		value: z.string(),
	})
);

const isSelectOptions = (options: unknown): options is SelectOptions => {
	return optionsSchema.safeParse(options).success;
};
