import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { IconButton, Stack, styled } from '@mui/material';
import { ChangeEventHandler, FC } from 'react';
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

	const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
		const files = e.target.files;

		if (files !== null && files[0] !== undefined) {
			setDocuments([...files]);
			return;
		}

		console.warn('[WARNING] File list is empty or null');
	};

	const handleReset = () => {
		setDocuments([]);
	};

	// Safely check documents array existence and length
	if (documents && documents.length > 0) {
		return (
			<>
				<div className={classes(styles.selectedFile, error !== undefined && styles.error)}>
					<IconButton className={styles.iconButton} onClick={handleReset}>
						<CloseOutlinedIcon />
					</IconButton>
					{documents.length} {t('form.files.label')}
				</div>

				{toArray(error)?.map((err) => (
					<span key={err.message} className={styles.errorMessage}>
						{err.message}
					</span>
				))}
			</>
		);
	}

	return (
		<Stack spacing={1}>
			<AppButton
				value={
					<>
						<VisuallyHiddenInput
							type="file"
							onChange={handleChange}
							accept="image/png, image/jpeg, application/pdf"
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
			/>
		</Stack>
	);
};
