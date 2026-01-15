import { apiClient, updateEmptyStringsToNull } from '~helpers';
import { API_ENDPOINTS } from '~services/urls';
import { GetShipsFilter, ShipDTO } from './types';

const createShip = async ({ documents, ...createShipRequest }: ShipDTO): Promise<string> => {
	const { data: createdShipId } = await apiClient.post<string, Omit<ShipDTO, 'documents'>>(
		API_ENDPOINTS.CreateShip,
		updateEmptyStringsToNull(createShipRequest)
	);

	await Promise.all(
		documents
			.filter((doc) => doc.files.length > 0)
			.map(async (doc) => {
				const formData = new FormData();

				formData.append('type', doc.type);
				doc.files.forEach((file) => formData.append('files', file));

				const uploadedDocs = await apiClient.post<string, FormData>(
					`${API_ENDPOINTS.CreateShip}/${createdShipId}`,
					formData
				);

				return uploadedDocs.data;
			})
	);

	// TODO: should return uploadedDocumentIds as well
	return createdShipId;
};

const getShips = async (filter?: GetShipsFilter): Promise<ShipDTO[]> => {
	// Remove undefined/empty values from filter to avoid sending unnecessary params
	const cleanFilter = filter
		? Object.fromEntries(Object.entries(filter).filter(([_, value]) => value !== undefined && value !== ''))
		: {};

	const data = await apiClient.get<ShipDTO[]>(API_ENDPOINTS.CreateShip, { params: cleanFilter });

	return data;
};

/**
 * Get all ships where isFleet is true
 * @param filter Optional filter parameters for boarding port
 * @returns Promise that resolves with an array of fleet ships
 */
const getFleets = async (filter?: GetShipsFilter): Promise<ShipDTO[]> => {
	// Remove undefined/empty values from filter to avoid sending unnecessary params
	const cleanFilter = filter
		? Object.fromEntries(Object.entries(filter).filter(([_, value]) => value !== undefined && value !== ''))
		: {};

	const data = await apiClient.get<ShipDTO[]>(`${API_ENDPOINTS.CreateShip}/fleets`, { params: cleanFilter });
	return data;
};

/**
 * Export ships data as a PDF document with optional filters
 * Opens the PDF in a new browser tab/window
 * @param boardingPort - Optional filter for boarding port
 * @param receiverName - Optional filter for receiver name
 * @param subCategory - Optional filter for cargo subcategory
 * @param isFleet - Optional flag to export fleet ships (true) or regular ships (false/undefined)
 * @returns Promise that resolves when the export process is initiated
 */
const exportShipsPDF = async (
	boardingPort?: string,
	receiverName?: string,
	subCategory?: string,
	isFleet?: boolean
): Promise<void> => {
	try {
		// Build query parameters
		const params = new URLSearchParams();
		if (boardingPort) params.append('boardingPort', boardingPort);
		if (receiverName) params.append('receiverName', receiverName);
		if (subCategory) params.append('subCategory', subCategory);
		if (isFleet !== undefined) params.append('isFleet', isFleet.toString());

		const queryString = params.toString();
		const endpoint = `${API_ENDPOINTS.CreateShip}/export-all-pdf${queryString ? `?${queryString}` : ''}`;

		// Ask axios to return blob (apiClient.get returns data directly, not full response)
		const blobData = await apiClient.get<Blob>(endpoint, {
			responseType: 'blob',
		});

		// Create blob from the returned data
		const blob = new Blob([blobData], { type: 'application/pdf' });
		const url = window.URL.createObjectURL(blob);

		const link = document.createElement('a');
		link.href = url;
		link.download = 'ships.pdf';
		document.body.appendChild(link);
		link.click();

		link.remove();
		window.URL.revokeObjectURL(url);
	} catch (error) {
		console.error('Error initiating PDF export:', error);
		throw error;
	}
};

/**
 * Updates an existing ship with its details and manages document uploads
 * @param id The UUID of the ship to update
 * @param shipData The ship data containing details and documents
 * @returns A promise that resolves when the update is complete
 */
const updateShip = async (id: string, { documents, ...updateShipRequest }: ShipDTO): Promise<void> => {
	// Update the ship details first (do NOT convert empty strings to null to avoid wiping fields)
	await apiClient.put<void, Omit<ShipDTO, 'documents'>>(`${API_ENDPOINTS.CreateShip}/${id}`, updateShipRequest);

	// Upload any new documents - only process documents with files
	await Promise.all(
		documents
			.filter((doc) => doc.files && doc.files.length > 0)
			.map(async (doc) => {
				const formData = new FormData();

				formData.append('type', doc.type);
				doc.files.forEach((file) => formData.append('files', file));

				const uploadedDocs = await apiClient.post<string[], FormData>(`${API_ENDPOINTS.CreateShip}/${id}`, formData);

				return uploadedDocs.data;
			})
	);
};

/**
 * Deletes a ship along with its cargo and documents
 * @param id The UUID of the ship to delete
 * @returns A promise that resolves when the deletion is complete
 */
const deleteShip = async (id: string): Promise<void> => {
	await apiClient.delete(`${API_ENDPOINTS.CreateShip}/${id}`);
};

/**
 * Get a specific ship by its ID
 * @param id The UUID of the ship to retrieve
 * @returns A promise that resolves with the ship data
 */
const getShipById = async (id: string): Promise<ShipDTO> => {
	const data = await apiClient.get<ShipDTO>(`${API_ENDPOINTS.CreateShip}/${id}`);
	return data;
};

/**
 * Get all ships for a specific agent
 * @param agentName Name of the agent
 * @returns Promise that resolves with an array of ships for that agent
 */
const getShipsByAgent = async (agentName: string): Promise<ShipDTO[]> => {
	const data = await apiClient.get<ShipDTO[]>(`${API_ENDPOINTS.CreateShip}/by-agent/${encodeURIComponent(agentName)}`);
	return data;
};

export const addShipService = {
	createShip,
	getShips,
	getFleets,
	getShipsByAgent,
	updateShip,
	deleteShip,
	getShipById,
	exportShipsPDF,
};
