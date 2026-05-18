import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { IconButton, Stack, styled } from '@mui/material';
import { ChangeEventHandler, FC, useRef } from 'react';
import { classes, toArray } from '~helpers';
import { useTranslation } from '~i18n';
import { Document } from '~pages/MainForms/AddOurShip/addOurShipSchema';
import { FormInputError } from '~types/utils';
import { AppButton } from '../AppButton';
import styles from './FileInput.module.css';

interface Props extends FormInputError<unknown> {
	title?: string;
	documents: Document[] | undefined;
	setDocuments: (documents: Document[]) => void;
}

const VisuallyHiddenInput = styled('input')({
	clip: 'rect(0 0 0 0)',
	clipPath: 'inset(50%)',
	height: 1,
	overflow: 'hidden',
	position: 'absolute',
	bottom: 0,
	left: 0,
	whiteSpace: 'nowrap',
	width: 1,
});

export const FileInput: FC<Props> = ({ title, documents, setDocuments, error }) => {
	const t = useTranslation();
	const inputRef = useRef<HTMLInputElement | null>(null);

	const formatFileSize = (size: number) => {
		if (size < 1024) {
			return `${size} B`;
		}

		if (size < 1024 * 1024) {
			return `${(size / 1024).toFixed(1)} KB`;
		}

		return `${(size / (1024 * 1024)).toFixed(1)} MB`;
	};

	const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
		const files = e.target.files;

		if (files !== null && files[0] !== undefined) {
			const nextFiles = Array.from(files);
			const existingFiles = documents ?? [];

			const mergedFiles = [...existingFiles];
			nextFiles.forEach((file) => {
				const alreadyExists = existingFiles.some(
					(existingFile) =>
						existingFile.name === file.name &&
						existingFile.size === file.size &&
						existingFile.lastModified === file.lastModified
				);

				if (!alreadyExists) {
					mergedFiles.push(file);
				}
			});

			setDocuments(mergedFiles);

			if (inputRef.current) {
				inputRef.current.value = '';
			}
			return;
		}

		console.warn('[WARNING] File list is empty or null');
	};

	const handleRemoveDocument = (indexToRemove: number) => {
		setDocuments((documents ?? []).filter((_, index) => index !== indexToRemove));
	};

	const handleReset = () => {
		setDocuments([]);

		if (inputRef.current) {
			inputRef.current.value = '';
		}
	};

	return (
		<Stack spacing={1.25} className={classes(styles.root, error !== undefined && styles.errorState)}>
			<div className={styles.header}>
				<AppButton
					value={
						<>
							<VisuallyHiddenInput
								ref={inputRef}
								type="file"
								onChange={handleChange}
								accept="image/png, image/jpeg, image/jpg, image/svg+xml, application/pdf"
								multiple
							/>
							{title ?? t('common.upload')}
						</>
					}
					component="label"
					variant="outlined"
					role={undefined}
					startIcon={<CloudUploadIcon />}
					color={error !== undefined ? 'error' : 'info'}
					className={styles.uploadButton}
					sx={{
						justifyContent: 'flex-start',
						textTransform: 'none',
						borderStyle: 'dashed',
						borderWidth: '1.5px',
						paddingInline: '1rem',
						paddingBlock: '0.7rem',
						fontWeight: 600,
						minWidth: { xs: '100%', sm: '11rem' },
					}}
				/>

				{documents && documents.length > 0 ? (
					<div className={classes(styles.selectedFilesSummary, error !== undefined && styles.error)}>
						<div>
							<div className={styles.selectedFilesLabel}>
								{documents.length} {t('form.files.label')}
							</div>
							<span className={styles.selectedFilesHint}>PNG, JPG, SVG, PDF</span>
						</div>
						<IconButton className={styles.clearButton} onClick={handleReset} size="small" aria-label="Clear files">
							<CloseOutlinedIcon />
						</IconButton>
					</div>
				) : (
					<div className={styles.emptyState}>PNG, JPG, SVG, PDF</div>
				)}
			</div>

			{documents && documents.length > 0 ? (
				<div className={styles.fileList}>
					{documents.map((document, index) => (
						<div key={`${document.name}-${document.lastModified}-${index}`} className={styles.selectedFile}>
							<div className={styles.fileMeta}>
								<div className={styles.fileIcon}>
									<DescriptionOutlinedIcon fontSize="small" />
								</div>
								<div className={styles.fileText}>
									<span className={styles.fileName} title={document.name}>
										{document.name}
									</span>
									<span className={styles.fileSize}>{formatFileSize(document.size)}</span>
								</div>
							</div>
							<IconButton
								className={styles.iconButton}
								onClick={() => handleRemoveDocument(index)}
								size="small"
								aria-label={`Remove ${document.name}`}
							>
								<CloseOutlinedIcon />
							</IconButton>
						</div>
					))}
				</div>
			) : null}

			{toArray(error)?.map((err) => (
				<span key={err.message} className={styles.errorMessage}>
					{err.message}
				</span>
			))}
		</Stack>
	);
};
