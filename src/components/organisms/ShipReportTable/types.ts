export interface ShipReport {
	name: string;
	imo: string;
	dwt: string;
	boardingPort: string;
	berthingDate: string;
	agent: string;
	receiver: string;
	email: string;
	phoneMobile: string;
	fournisseur: string;
	cargaison: boolean;
	category: string;
	tonnage: string;
	shipDocuments: string[];
	charterDocuments: string[];
	receiverDocuments: string[];
	originalShipData?: any; // Reference to the original ship data to access cargo details
}
