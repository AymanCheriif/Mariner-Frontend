export interface CargoSubCategoryOptionDTO {
	id: string;
	name: string;
}

export interface CargoCategoryOptionDTO {
	id: string;
	name: string;
	subCategories: CargoSubCategoryOptionDTO[];
}

export interface UpsertCargoCategoryRequest {
	name: string;
}

export interface UpsertCargoSubCategoryRequest {
	name: string;
}
