import { FC, useState } from 'react';
import { Controller, Path, useFormContext, useWatch } from 'react-hook-form';
import { FileInput, DocumentImage } from '~components/atoms';
import { classes } from '~helpers/utils';
import { useTranslation } from '~i18n';
import { TxKeyPath } from '~i18n/types';
import { AddOurShipRequest } from '~pages/MainForms/AddOurShip/addOurShipSchema';
import styles from './DocumentationFormItem.module.css';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { IconButton, Box, CircularProgress } from '@mui/material';
import { documentsService } from '~services';

type DocumentFormPath = 'documents.ship' | 'documents.charter' | 'documents.receiver';

type PreviewIdsName = keyof Pick<AddOurShipRequest, 'shipDocuments' | 'charterDocuments' | 'receiverDocuments'>;

interface Props {
	titleKey: TxKeyPath;
	formName: DocumentFormPath;
	previewIdsName?: PreviewIdsName;
}

export const DocumentationFormItem: FC<Props> = ({ titleKey: title, formName, previewIdsName }) => {
	const t = useTranslation();
	const { control, setValue } = useFormContext<AddOurShipRequest>();

	// Derive preview key from formName when not provided
	const derivedPreviewKeyMap: Record<DocumentFormPath, PreviewIdsName> = {
		'documents.ship': 'shipDocuments',
		'documents.charter': 'charterDocuments',
		'documents.receiver': 'receiverDocuments',
	};
	const previewKey = (previewIdsName ?? derivedPreviewKeyMap[formName]) as PreviewIdsName;

	const previewIds = useWatch({ control, name: previewKey as Path<AddOurShipRequest>, defaultValue: [] as string[] }) as string[];

	// Track deleting state per image id
	const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

	const handleDelete = async (docId: string) => {
		// set deleting state
		setDeletingIds((prev) => new Set(prev).add(docId));
		try {
			await documentsService.deleteDocument(docId);
			const next = (previewIds ?? []).filter((id) => id !== docId);
			setValue(previewKey as Path<AddOurShipRequest>, next as any, { shouldDirty: true });
		} catch (e) {
			console.error('Failed to delete document', e);
		} finally {
			// clear deleting state regardless of success
			setDeletingIds((prev) => {
				const next = new Set(prev);
				next.delete(docId);
				return next;
			});
		}
	};

	return (
		<div className={styles.row}>
			<h6 className={styles.documentationTitle}>{t(title)}</h6>

			<div className={classes(styles.row, styles.wrap)}>
				{/* Existing documents preview (update mode) */}
				{Array.isArray(previewIds) && previewIds.length > 0 && (
					<div className={styles.previewContainer}>
						{previewIds.map((id) => (
							<Box key={id} className={styles.previewItem}>
								{/* Deleting overlay */}
								{deletingIds.has(id) && (
									<div className={styles.deletingOverlay}>
										<CircularProgress size={24} />
									</div>
								)}
								<DocumentImage id={id} isUpdate={true} />
								<IconButton
									size="small"
									onClick={() => handleDelete(id)}
									disabled={deletingIds.has(id)}
									title={t('common.delete')}
									sx={{
										position: 'absolute',
										top: -4,
										right: -4,
										bgcolor: 'rgba(255,123,123,0.8)',
										color: 'rgba(253,249,249,0.8)',
										'&:hover': {
											bgcolor: 'red',
											'& .MuiSvgIcon-root': {
												color: 'white',
											},
										},
									}}
								>
									<DeleteOutlineIcon fontSize="small" />
								</IconButton>
							</Box>
						))}
					</div>
				)}

				{/* Upload new files */}
				<Controller<AddOurShipRequest>
					name={formName as Path<AddOurShipRequest>}
					control={control}
					render={({ field, fieldState }) => (
						<FileInput documents={(field.value as File[] | undefined) || []} setDocuments={field.onChange} error={fieldState.error} />
					)}
				/>
			</div>
		</div>
	);
};
