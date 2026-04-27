import { Box, CircularProgress, Typography } from '@mui/material';
import type { FC } from 'react';
import { AppButton } from '../AppButton';

interface TableStateOverlayProps {
	message: string;
	mode: 'loading' | 'empty';
	onClear?: () => void;
	clearLabel?: string;
}

export const TableStateOverlay: FC<TableStateOverlayProps> = ({
	message,
	mode,
	onClear,
	clearLabel = 'Clear filters',
}) => {
	return (
		<Box
			sx={{
				position: 'absolute',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				background: 'rgba(248, 250, 252, 0.88)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				zIndex: 4,
				backdropFilter: 'blur(1px)',
			}}
		>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 2,
					textAlign: 'center',
					px: 4,
					py: 3,
					borderRadius: '16px',
					backgroundColor: 'rgba(255,255,255,0.92)',
					boxShadow: '0 10px 30px rgba(15, 23, 42, 0.10)',
					border: '1px solid rgba(148, 163, 184, 0.18)',
					minWidth: 280,
					maxWidth: 420,
				}}
			>
				{mode === 'loading' ? <CircularProgress size={34} thickness={4} /> : null}
				<Typography
					variant="body1"
					sx={{
						color: '#6b7280',
						fontWeight: 500,
						lineHeight: 1.6,
					}}
				>
					{message}
				</Typography>
				{mode === 'empty' && onClear ? (
					<AppButton value={clearLabel} variant="outlined" onClick={onClear} sx={{ minWidth: 150 }} />
				) : null}
			</Box>
		</Box>
	);
};