import type { ButtonProps } from '@mui/material';
import { Button } from '@mui/material';

import type { FC, ReactNode } from 'react';

interface Props extends Omit<ButtonProps, 'value'> {
	value?: string | ReactNode;
}

export const AppButton: FC<Props> = ({ value, variant = 'contained', ...props }) => {
	return (
		<Button variant={variant} {...props}>
			{value}
		</Button>
	);
};
