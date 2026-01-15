import type { Color } from '@mui/material';
import { createTheme } from '@mui/material';

type ColorPartial = Partial<Color>;
declare module '@mui/material/styles' {
	interface PaletteColor extends ColorPartial {}
}

export const muiTheme = createTheme({
	palette: {
		mode: 'light',
	},
	typography: {
		fontFamily: ['"Manrope"', 'sans-serif'].join(','),
	},
});
