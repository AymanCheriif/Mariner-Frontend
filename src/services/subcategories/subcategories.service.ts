import apiClient from '~helpers/axiosApiClient';
import { SubCategorySummaryDTO } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const API_ENDPOINTS = {
	SubCategories: `${API_BASE_URL}/subcategories`,
};

/**
 * Get sub-category summaries with receiver tonnages
 * @returns Promise that resolves with an array of sub-category summaries
 */
const getSubCategorySummaries = async (): Promise<SubCategorySummaryDTO[]> => {
	const data = await apiClient.get<SubCategorySummaryDTO[]>(`${API_ENDPOINTS.SubCategories}/summaries`);
	return data;
};

export const subCategoriesService = {
	getSubCategorySummaries,
};

