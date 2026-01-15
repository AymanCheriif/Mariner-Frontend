import { FC, useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import { API_BASE_URL, API_ENDPOINTS } from '~services/urls';
import { CONSTANTS } from '~helpers/constants';
import styles from './DocumentViewer.module.css';

interface Props {
	id: string;
	isUpdate?: boolean;
	filename?: string;
}

export const DocumentViewer: FC<Props> = ({ id, isUpdate, filename = 'document' }) => {
	const url = `${API_BASE_URL}${API_ENDPOINTS.Documents}/${id}`;
	const [isImage, setIsImage] = useState<boolean | null>(null);
	const [hasError, setHasError] = useState(false);
	const [isDownloading, setIsDownloading] = useState(false);

	// Detect if the document is an image by trying to load it
	const handleImageLoad = () => {
		setIsImage(true);
	};

	const handleImageError = () => {
		setIsImage(false);
		setHasError(true);
	};

	const handleDownload = async () => {
		if (isDownloading) return;

		setIsDownloading(true);
		try {
			const accessToken = localStorage.getItem(CONSTANTS.AccessToken);

			// Fetch the file with authentication
			const response = await fetch(url, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (!response.ok) {
				throw new Error('Download failed');
			}

			// Get the blob
			const blob = await response.blob();

			// Create a temporary URL for the blob
			const blobUrl = window.URL.createObjectURL(blob);

			// Create download link
			const link = document.createElement('a');
			link.href = blobUrl;
			link.download = `${filename}.pdf`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			// Clean up the blob URL
			window.URL.revokeObjectURL(blobUrl);
		} catch (error) {
			console.error('Error downloading file:', error);
			alert('Failed to download file. Please try again.');
		} finally {
			setIsDownloading(false);
		}
	};

	// Try to load as image first
	if (isImage === null && !hasError) {
		return (
			<Box sx={{ position: 'relative', display: 'inline-block' }}>
				<img
					src={url}
					alt={filename}
					className={styles.image}
					style={{ maxWidth: isUpdate ? '100px' : '95%', display: 'none' }}
					onLoad={handleImageLoad}
					onError={handleImageError}
				/>
				<Box
					sx={{
						width: isUpdate ? '100px' : '200px',
						height: isUpdate ? '100px' : '200px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						bgcolor: '#f5f5f5',
						borderRadius: '8px',
					}}
				>
					Loading...
				</Box>
			</Box>
		);
	}

	// If it's an image, display it normally
	if (isImage) {
		return <img src={url} alt={filename} className={styles.image} style={{ maxWidth: isUpdate ? '100px' : '95%' }} />;
	}

	// If it's not an image (PDF), show PDF icon with download/print buttons
	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				gap: 2,
				padding: 2,
				bgcolor: '#f5f5f5',
				borderRadius: '8px',
				border: '1px solid #e0e0e0',
				maxWidth: isUpdate ? '100px' : '400px',
			}}
		>
			<PictureAsPdfIcon
				sx={{
					fontSize: isUpdate ? '40px' : '60px',
					color: '#d32f2f',
				}}
			/>
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Box
					sx={{
						fontSize: '14px',
						fontWeight: 500,
						color: '#333',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
					}}
				>
					{filename || 'PDF Document'}
				</Box>
				<Box
					sx={{
						fontSize: '12px',
						color: '#666',
						mt: 0.5,
					}}
				>
					PDF File
				</Box>
			</Box>
			{!isUpdate && (
				<Tooltip title="Download PDF" arrow>
					<IconButton
						size="small"
						onClick={handleDownload}
						disabled={isDownloading}
						sx={{
							color: '#1976d2',
							'&:hover': {
								backgroundColor: 'rgba(25, 118, 210, 0.08)',
							},
							opacity: isDownloading ? 0.6 : 1,
						}}
					>
						{isDownloading ? (
							<Box
								sx={{
									width: '20px',
									height: '20px',
									border: '2px solid #1976d2',
									borderTopColor: 'transparent',
									borderRadius: '50%',
									animation: 'spin 0.8s linear infinite',
									'@keyframes spin': {
										'0%': { transform: 'rotate(0deg)' },
										'100%': { transform: 'rotate(360deg)' },
									},
								}}
							/>
						) : (
							<DownloadIcon />
						)}
					</IconButton>
				</Tooltip>
			)}
		</Box>
	);
};
