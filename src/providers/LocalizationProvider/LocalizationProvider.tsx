import { LocalizationProvider as Provider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { FC, PropsWithChildren } from 'react';

export const LocalizationProvider: FC<PropsWithChildren> = ({ children }) => {
	return <Provider dateAdapter={AdapterDayjs}>{children}</Provider>;
};
