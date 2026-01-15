import { Nullable, NullableOrUndefined } from '~types/utils';

interface ShipPersonnelContactDTO {
	id?: string;
	name: string;
	phoneNumber: Nullable<string>;
	whatsAppNumber: Nullable<string>;
	weChatNumber: Nullable<string>;
}

interface ShipCargoDTO {
	id?: string;
	type: string;
	category: string;
	subCategory: string;
	tonnage: string;
	// Receiver fields
	receiverMIC?: string;
	receiverName: string;
	receiverEmail?: string;
	receiverPhoneFixe?: string;
	receiverPhoneMobile?: string;
	// Fournisseur fields
	fournisseurMIC?: string;
	fournisseurName: string;
	fournisseurEmail?: string;
	fournisseurPhoneFixe?: string;
	fournisseurPhoneMobile?: string;
	// Legacy fields (kept for backward compatibility)
	phoneNumber: string;
	whatsAppNumber: string;
	email: string;
}

interface DocumentDTO {
	id?: string;
	type: 'SHIP' | 'CHARTER' | 'RECEIVER';
	files: File[];
}

export interface ShipDTO {
	id?: string;
	name: string;
	imo: string;
	dwt: string;
	shipType?: NullableOrUndefined<string>;
	boardingPort: string;
	shipStatus: string;
	provenance: string;
	agent?: NullableOrUndefined<string>;
	remarksAndFacts: string;
	performanceRate: string;

	berthingDate: string;
	completionDate: string;

	shipOwner: Nullable<ShipPersonnelContactDTO>;
	operationDepart: Nullable<ShipPersonnelContactDTO>;
	chartingDepart: Nullable<ShipPersonnelContactDTO>;

	cargoes: ShipCargoDTO[];

	// Documents are no longer part of shipDTO,
	// they are used as internal state to pass documents for upload
	documents: DocumentDTO[];

	shipDocuments: string[];
	charterDocuments: string[];
	receiverDocuments: string[];

	isFleet?: boolean;
}

export type GetShipsFilter = {
	page?: number;
	size?: number;
	boardingPort?: string;
	receiverName?: string;
	subCategory?: string;
	category?: string;
	dateFrom?: string;
	dateTo?: string;
};

export interface CargoDetailsDTO {
	shipName: string;
	shipImo: string;
	boardingPort: string;
	completionDate: string;
	category: string;
	subCategory: string;
	tonnage: string;
	provenance: string;
	receiverName: string;
	fournisseurName: string;
	receiverDocuments?: string[];
}

