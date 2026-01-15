export interface CargoDetailsDTO {
	shipName: string;
	shipImo: string;
	boardingPort: string;
	completionDate: string;
	category: string;
	subCategory: string;
	tonnage: string;
	provenance: string;
	fournisseurName: string;
	receiverDocuments?: string[]; // UUIDs of receiver documents
}

export interface ReceiverSummaryDTO {
	receiverId: string;
	receiverName: string;
	receiverEmail: string | null;
	receiverPhoneFixe: string | null;
	receiverPhoneMobile: string | null;
	totalCargoes: number;
	totalTonnage: number;
	categories: string[];
	subCategories: string[];
	cargoes: CargoDetailsDTO[];
}

export type GetReceiversFilter = {
	receiverName?: string;
	subCategory?: string;
};
