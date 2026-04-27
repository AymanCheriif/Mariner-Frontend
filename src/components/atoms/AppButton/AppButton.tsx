import type { ButtonProps } from '@mui/material';
import { Button, CircularProgress } from '@mui/material';

import type { FC, ReactNode } from 'react';

interface Props extends Omit<ButtonProps, 'value'> {
	value?: string | ReactNode;
	loading?: boolean;
}

export const AppButton: FC<Props> = ({ value, variant = 'contained', loading = false, disabled, startIcon, ...props }) => {
	return (
		<Button
			variant={variant}
			disabled={disabled || loading}
			startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
			{...props}
		>
			{value}
		</Button>
	);
};
