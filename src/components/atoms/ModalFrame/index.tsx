import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { Box, IconButton } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

interface ModalHeaderActionsProps {
	isFullscreen: boolean;
	onToggleFullscreen: () => void;
	onClose: () => void;
	sx?: SxProps<Theme>;
}

export const getModalContainerSx = (
	isFullscreen: boolean,
	width: number | string,
	maxHeight = '88vh'
): SxProps<Theme> => {
	const resolvedWidth = typeof width === 'number' ? `${width}px` : width;

	return {
		position: 'absolute',
		top: isFullscreen ? 0 : '50%',
		left: isFullscreen ? 0 : '50%',
		transform: isFullscreen ? 'none' : 'translate(-50%, -50%)',
		width: isFullscreen ? '100vw' : `min(${resolvedWidth}, 96vw)`,
		maxWidth: '100vw',
		height: isFullscreen ? '100vh' : 'auto',
		maxHeight: isFullscreen ? '100vh' : maxHeight,
		overflow: 'auto',
		bgcolor: 'background.paper',
		borderRadius: isFullscreen ? 0 : '16px',
		boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
		p: isFullscreen ? 3 : 4,
		outline: 'none',
	};
};

export const ModalHeaderActions = ({
	isFullscreen,
	onToggleFullscreen,
	onClose,
	sx,
}: ModalHeaderActionsProps) => (
	<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ...sx }}>
		<IconButton onClick={onToggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} size="small">
			{isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
		</IconButton>
		<IconButton onClick={onClose} aria-label="Close" size="small">
			<CloseIcon />
		</IconButton>
	</Box>
);
