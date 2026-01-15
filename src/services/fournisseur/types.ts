import { CargoDetailsDTO } from '../addShip/types';

export interface FournisseurSummaryDTO {
	fournisseurId: string;
	fournisseurName: string;
	fournisseurEmail: string;
	fournisseurPhoneFixe: string;
	fournisseurPhoneMobile: string;
	totalTonnage: number;
	categories: string[];
	subCategories: string[];
	cargoes: CargoDetailsDTO[];
}

export interface GetFournisseursFilter {
	fournisseurName?: string;
	subCategory?: string;
}

