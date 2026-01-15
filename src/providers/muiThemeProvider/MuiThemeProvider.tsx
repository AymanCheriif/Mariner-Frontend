import { ThemeProvider } from '@mui/material';
import { Experimental_CssVarsProvider as CssVarsProvider, StyledEngineProvider } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { muiTheme } from './muiTheme';

export const MuiThemeProvider: FC<PropsWithChildren> = ({ children }) => (
	<StyledEngineProvider injectFirst>
		<CssVarsProvider>
			<ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
		</CssVarsProvider>
	</StyledEngineProvider>
);
