import { TextareaAutosize, TextareaAutosizeProps } from '@mui/material';
import { forwardRef } from 'react';
import { FormInputError } from '~types/utils';
import styles from './TextArea.module.css';

type Props = FormInputError<TextareaAutosizeProps>;

export const TextArea = forwardRef<HTMLTextAreaElement, Props>(({ minRows = 3, ...props }, ref) => {
	return <TextareaAutosize minRows={minRows} className={styles.textArea} {...props} ref={ref} />;
});
