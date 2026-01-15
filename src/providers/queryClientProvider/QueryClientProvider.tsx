import queryClient from './queryCliient';

import { QueryClientProvider as Provider } from '@tanstack/react-query';
import type { FC, PropsWithChildren } from 'react';

export const QueryClientProvider: FC<PropsWithChildren> = ({ children }) => {
	return <Provider client={queryClient}>{children}</Provider>;
};
