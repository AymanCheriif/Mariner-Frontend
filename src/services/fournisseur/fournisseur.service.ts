import apiClient from '~helpers/axiosApiClient';
import { API_BASE_URL } from '~services/urls';
import { FournisseurSummaryDTO, GetFournisseursFilter } from './types';

const API_ENDPOINTS = {
	Fournisseurs: `${API_BASE_URL}/fournisseurs`,
};

/**
 * Get all fournisseurs with optional filters
 * @param filter Optional filter parameters
 * @returns Promise that resolves with an array of fournisseurs
 */
const getAllFournisseurs = async (filter?: GetFournisseursFilter): Promise<FournisseurSummaryDTO[]> => {
	const cleanFilter = filter
		? Object.fromEntries(Object.entries(filter).filter(([_, value]) => value !== undefined && value !== ''))
		: {};

	const data = await apiClient.get<FournisseurSummaryDTO[]>(API_ENDPOINTS.Fournisseurs, { params: cleanFilter });
	return data;
};

/**
 * Get a specific fournisseur by ID
 * @param fournisseurId The ID of the fournisseur
 * @returns Promise that resolves with the fournisseur data
 */
const getFournisseurById = async (fournisseurId: string): Promise<FournisseurSummaryDTO> => {
	const data = await apiClient.get<FournisseurSummaryDTO>(`${API_ENDPOINTS.Fournisseurs}/${fournisseurId}`);
	return data;
};

export const fournisseurService = {
	getAllFournisseurs,
	getFournisseurById,
};

