import { apiClient } from '~helpers';
import { GetReceiversFilter, ReceiverSummaryDTO } from './types';

const RECEIVERS_URL = '/ships/receivers';

const getAllReceivers = async (filter?: GetReceiversFilter): Promise<ReceiverSummaryDTO[]> => {
	const params = new URLSearchParams();
	
	if (filter?.receiverName) {
		params.append('receiverName', filter.receiverName);
	}
	
	if (filter?.subCategory) {
		params.append('subCategory', filter.subCategory);
	}
	
	const url = params.toString() ? `${RECEIVERS_URL}?${params.toString()}` : RECEIVERS_URL;
	const data = await apiClient.get<ReceiverSummaryDTO[]>(url);
	return data;
};

export const receiversService = {
	getAllReceivers,
};
