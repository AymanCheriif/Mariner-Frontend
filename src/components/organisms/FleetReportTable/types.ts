export interface FleetReport {
	name: string;
	imo: string;
	dwt: string;
	boardingPort: string;
	berthingDate: string;
	completionDate: string;
	receiver: string;
	email: string;
	phoneNumber: string;
	fournisseur: string;
	cargaison: boolean;
	tonnage: string;
	shipDocuments: string[];
	charterDocuments: string[];
	receiverDocuments: string[];
	originalShipData?: any; // Reference to the original ship data to access cargo details
}
