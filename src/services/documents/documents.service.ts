import { apiClient } from '~helpers';
import { API_ENDPOINTS } from '~services/urls';

const deleteDocument = async (id: string): Promise<void> => {
	await apiClient.delete(`${API_ENDPOINTS.Documents}/${id}`);
};

export const documentsService = {
	deleteDocument,
};

