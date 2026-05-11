import apiClient from '~helpers/axiosApiClient';
import { API_BASE_URL } from '~services/urls';
import {
	CargoCategoryOptionDTO,
	CargoSubCategoryOptionDTO,
	UpsertCargoCategoryRequest,
	UpsertCargoSubCategoryRequest,
} from './types';

const API_ENDPOINTS = {
	CargoTaxonomy: `${API_BASE_URL}/cargo-taxonomy`,
};

const getCargoCategories = async (): Promise<CargoCategoryOptionDTO[]> => {
	return apiClient.get<CargoCategoryOptionDTO[]>(API_ENDPOINTS.CargoTaxonomy);
};

const createCategory = async (body: UpsertCargoCategoryRequest): Promise<CargoCategoryOptionDTO> => {
	const response = await apiClient.post<CargoCategoryOptionDTO, UpsertCargoCategoryRequest>(
		`${API_ENDPOINTS.CargoTaxonomy}/categories`,
		body
	);
	return response.data;
};

const updateCategory = async ({ id, ...body }: UpsertCargoCategoryRequest & { id: string }): Promise<CargoCategoryOptionDTO> => {
	return apiClient.put<CargoCategoryOptionDTO, UpsertCargoCategoryRequest>(
		`${API_ENDPOINTS.CargoTaxonomy}/categories/${id}`,
		body
	);
};

const deleteCategory = async (id: string): Promise<void> => {
	await apiClient.delete<void>(`${API_ENDPOINTS.CargoTaxonomy}/categories/${id}`);
};

const createSubCategory = async ({
	categoryId,
	...body
}: UpsertCargoSubCategoryRequest & { categoryId: string }): Promise<CargoSubCategoryOptionDTO> => {
	const response = await apiClient.post<CargoSubCategoryOptionDTO, UpsertCargoSubCategoryRequest>(
		`${API_ENDPOINTS.CargoTaxonomy}/categories/${categoryId}/subcategories`,
		body
	);
	return response.data;
};

const updateSubCategory = async ({
	id,
	...body
}: UpsertCargoSubCategoryRequest & { id: string }): Promise<CargoSubCategoryOptionDTO> => {
	return apiClient.put<CargoSubCategoryOptionDTO, UpsertCargoSubCategoryRequest>(
		`${API_ENDPOINTS.CargoTaxonomy}/subcategories/${id}`,
		body
	);
};

const deleteSubCategory = async (id: string): Promise<void> => {
	await apiClient.delete<void>(`${API_ENDPOINTS.CargoTaxonomy}/subcategories/${id}`);
};

export const cargoTaxonomyService = {
	getCargoCategories,
	createCategory,
	updateCategory,
	deleteCategory,
	createSubCategory,
	updateSubCategory,
	deleteSubCategory,
};
