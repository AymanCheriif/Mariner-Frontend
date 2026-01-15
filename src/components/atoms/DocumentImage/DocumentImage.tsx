import { FC } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '~services/urls';
import styles from './DocumentImage.module.css';

interface Props {
	id: string;
	isUpdate?: boolean;
}

export const DocumentImage: FC<Props> = ({ id, isUpdate }) => {
	const url = `${API_BASE_URL}${API_ENDPOINTS.Documents}/${id}`;

	return   <img
		className={styles.image}
		src={url}
		style={{maxWidth: isUpdate ? '100px' : '95%'}}
	/>;
};
