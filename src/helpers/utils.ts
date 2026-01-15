export const classes = (...classNames: (string | undefined | boolean)[]) => {
	return classNames.filter((name) => typeof name === 'string').join(' ');
};

export const toArray = <T>(data: T | T[] | undefined) => {
	if (data === undefined) {
		return [];
	}

	if (Array.isArray(data)) {
		return data;
	}

	return [data];
};

export const updateEmptyStringsToNull = <T extends object>(obj: T): T => {
	for (const key in obj) {
		const value = obj[key];

		if (value instanceof File) {
			continue;
		}

		if (typeof value === 'string' && value === '') {
			obj[key] = null as any;
			continue;
		}

		if (typeof value === 'object' && value !== null) {
			updateEmptyStringsToNull(value);
			continue;
		}

		if (Array.isArray(value) && value.length > 0) {
			value.forEach(updateEmptyStringsToNull);
			continue;
		}
	}

	return obj;
};

/**
 * Maps a ShipDTO from the API to the form values structure
 * @param shipDto The ship data from the API
 * @returns Form values structure for the update form
 */
export const mapShipDtoToFormValues = (shipDto: any) => {
	return {
		addShip: {
			shipName: shipDto.name || '',
			shipImo: shipDto.imo || '',
			dwt: shipDto.dwt || '',
			shipType: shipDto.shipType || '',
			boardingPort: shipDto.boardingPort || '',
			berthingDate: shipDto.berthingDate ? new Date(shipDto.berthingDate) : new Date(),
			completionDate: shipDto.completionDate ? new Date(shipDto.completionDate) : new Date(),
			shipStatus: shipDto.shipStatus || '',
			provenance: shipDto.provenance || '',
			agent: shipDto.agent || 'NAVLION',
		},
		shipOwner: {
			name: shipDto.shipOwner?.name || '',
			phoneNumber: shipDto.shipOwner?.phoneNumber || '',
			whatsAppNumber: shipDto.shipOwner?.whatsAppNumber || '',
			wechatNumber: shipDto.shipOwner?.weChatNumber || '',
		},
		operationDepart: {
			name: shipDto.operationDepart?.name || '',
			phoneNumber: shipDto.operationDepart?.phoneNumber || '',
			whatsAppNumber: shipDto.operationDepart?.whatsAppNumber || '',
			wechatNumber: shipDto.operationDepart?.weChatNumber || '',
		},
		chartingDepart: {
			name: shipDto.chartingDepart?.name || '',
			phoneNumber: shipDto.chartingDepart?.phoneNumber || '',
			whatsAppNumber: shipDto.chartingDepart?.whatsAppNumber || '',
			wechatNumber: shipDto.chartingDepart?.weChatNumber || '',
		},
		cargoes: shipDto.cargoes || [],
		remarksAndFacts: shipDto.remarksAndFacts || '',
		performanceRate: shipDto.performanceRate || '',
		// For uploads, we keep File[] arrays empty by default in update mode
		documents: {
			ship: [],
			charter: [],
			receiver: [],
		},
		// Preview existing document IDs
		shipDocuments: shipDto.shipDocuments || [],
		charterDocuments: shipDto.charterDocuments || [],
		receiverDocuments: shipDto.receiverDocuments || [],
	};
};
