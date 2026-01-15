import { DateTimePicker, DateTimePickerProps, renderTimeViewClock } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { FC, forwardRef, useId } from 'react';
import { classes } from '~helpers/utils';
import { FormInputError, Nullable, NullableOrUndefined } from '~types/utils';
import styles from './AppDatePicker.module.css';

interface Props extends FormInputError<Omit<DateTimePickerProps<Dayjs>, 'onChange' | 'value'>> {
	muiLabel?: string;
	value?: NullableOrUndefined<Date>;
	onChange: (value?: Date) => void;
}

export const AppDatePicker: FC<Props> = forwardRef<HTMLInputElement, Props>(
	({ muiLabel, label, value, onChange, error, ...props }, ref) => {
		const id = useId();
		const isError = error?.message !== undefined;

		const handleChange = (newValue: Nullable<Dayjs>) => {
			onChange(newValue?.toDate());
		};

		return (
			<div className={styles.container}>
				{label && (
					<label htmlFor={id} className={classes(styles.label, isError && styles.error)}>
						{label}
					</label>
				)}
				<DateTimePicker
					label={muiLabel}
					ref={ref}
					viewRenderers={{
						hours: renderTimeViewClock,
						minutes: renderTimeViewClock,
						seconds: renderTimeViewClock,
					}}
					value={dayjs(value)}
					onChange={handleChange}
					{...props}
				/>
			</div>
		);
	}
);
