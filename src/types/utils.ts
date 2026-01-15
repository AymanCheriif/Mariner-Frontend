import { FieldError } from 'react-hook-form';

export type Callback = () => void;
export type Consumer<T> = (value: T) => void;
export type Nullable<T> = T | null;
export type Undefined<T> = T | undefined;
export type NullableOrUndefined<T> = T | null | undefined;
export type FormInputError<T> = Omit<T, 'error'> & {
	error?: FieldError | undefined;
};
