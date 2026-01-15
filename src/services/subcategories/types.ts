export interface ReceiverTonnageDTO {
	receiverName: string;
	tonnage: number;
}

export interface SubCategorySummaryDTO {
	subCategory: string;
	totalTonnage: number;
	receivers: ReceiverTonnageDTO[];
}

