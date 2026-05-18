export interface ReceiverTonnageDTO {
	receiverName: string;
	tonnage: number;
	previousYearTonnage?: number | null;
	currentYearTonnage?: number | null;
}

export interface SubCategorySummaryDTO {
	subCategory: string;
	totalTonnage: number;
	receivers: ReceiverTonnageDTO[];
	previousYearTonnage?: number | null;
	currentYearTonnage?: number | null;
}

