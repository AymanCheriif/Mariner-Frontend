import { UseMutateFunction } from '@tanstack/react-query';
import { Consumer } from '~types/utils';

export interface IQueryDescriptor<TResponse> {
	data: TResponse | undefined;
	isLoading: boolean;
	isSuccess: boolean;
	isError: boolean;
}

export interface TRequestDescriptor<TResponse, TRequest = void, TError = Error> extends IQueryDescriptor<TResponse> {
	mutate: UseMutateFunction<TResponse, TError, TRequest>;
}

export type OnUseMutationSuccess<TResponse> = (response: TResponse) => void;

export type UseCustomMutation<TResponse, TRequest = void> = (
	onSuccess: OnUseMutationSuccess<TResponse>,
	onError?: Consumer<Error>
) => TRequestDescriptor<TResponse, TRequest>;
