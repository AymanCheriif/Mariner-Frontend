import apiClient from '~helpers/axiosApiClient';
import { API_BASE_URL } from '~services/urls';
import { SubCategorySummaryDTO } from './types';

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

