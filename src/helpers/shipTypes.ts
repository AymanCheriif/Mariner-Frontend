export const SHIP_TYPES = {
	ANY_TYPE: 'Any type',
	CARGO: {
		label: 'Cargo',
		subtypes: {
			ALL_CARGO_VESSELS: 'All Cargo Vessels',
			BULK_CARRIER: 'Bulk carrier',
			GENERAL_CARGO: 'General Cargo',
			CONTAINER_SHIP: 'Container Ship',
			REEFER: 'Reefer',
			RO_RO: 'Ro-Ro',
			VEHICLES_CARRIER: 'Vehicles Carrier',
			CEMENT_CARRIER: 'Cement Carrier',
			WOOD_CHIPS_CARRIER: 'Wood Chips Carrier',
			UREA_CARRIER: 'Urea Carrier',
			AGGREGATES_CARRIER: 'Aggregates Carrier',
			LIMESTONE_CARRIER: 'Limestone Carrier',
			LANDING_CRAFT: 'Landing Craft',
			LIVESTOCK_CARRIER: 'Livestock Carrier',
			HEAVY_LOAD_CARRIER: 'Heavy Load Carrier',
		},
	},
	TANKERS: {
		label: 'Tankers',
		subtypes: {
			ALL_TANKERS: 'All Tankers',
			CRUDE_OIL_TANKER: 'Crude Oil Tanker',
			OIL_PRODUCTS_TANKER: 'Oil Products Tanker',
			CHEMICAL_OIL_TANKER: 'Chemical / Oil Tanker',
			LNG_TANKER: 'LNG Tanker',
			LPG_TANKER: 'LPG Tanker',
			ASPHALT_BITUMEN: 'Asphalt / Bitumen',
			BUNKERING_TANKER: 'Bunkering Tanker',
			FSO_FPSO: 'FSO / FPSO',
			OTHER_TANKER: 'Other Tanker',
		},
	},
	PASSENGER_CRUISE: {
		label: 'Passenger/Cruise',
		subtypes: {
			ALL_PASSENGER_CRUISE: 'All Passenger/Cruise Ships',
			CRUISE_SHIP: 'Cruise Ship',
			PASSENGER_CARGO_SHIP: 'Passenger / Cargo Ship',
			PASSENGER_RO_RO_SHIP: 'Passenger / Ro-Ro Ship',
			PASSENGER_SHIP: 'Passenger Ship',
		},
	},
	OTHER: {
		label: 'Other',
		subtypes: {
			FISHING_SHIPS: 'Fishing ships',
			YACHTS_SAILING: 'Yachts / Sailing Vessels',
			MILITARY: 'Military',
			TUGS: 'Tugs',
			OTHER_AUXILIARY: 'Other type / Auxiliary',
			UNKNOWN: 'Unknown',
		},
	},
};

// Flatten ship types for dropdown options
export const getShipTypeOptions = (): string[] => {
	const options: string[] = [SHIP_TYPES.ANY_TYPE];

	// Add all subtypes from each category
	Object.values(SHIP_TYPES).forEach((category) => {
		if (typeof category === 'object' && 'subtypes' in category) {
			Object.values(category.subtypes).forEach((subtype) => {
				options.push(subtype);
			});
		}
	});

	return options;
};

// Get ship type with category label (for display purposes)
export const getShipTypeWithCategory = (): Array<{ label: string; value: string; category?: string }> => {
	const options: Array<{ label: string; value: string; category?: string }> = [
		{ label: SHIP_TYPES.ANY_TYPE, value: SHIP_TYPES.ANY_TYPE },
	];

	// Add cargo types
	Object.entries(SHIP_TYPES.CARGO.subtypes).forEach(([_, value]) => {
		options.push({ label: value, value: value, category: SHIP_TYPES.CARGO.label });
	});

	// Add tanker types
	Object.entries(SHIP_TYPES.TANKERS.subtypes).forEach(([_, value]) => {
		options.push({ label: value, value: value, category: SHIP_TYPES.TANKERS.label });
	});

	// Add passenger/cruise types
	Object.entries(SHIP_TYPES.PASSENGER_CRUISE.subtypes).forEach(([_, value]) => {
		options.push({ label: value, value: value, category: SHIP_TYPES.PASSENGER_CRUISE.label });
	});

	// Add other types
	Object.entries(SHIP_TYPES.OTHER.subtypes).forEach(([_, value]) => {
		options.push({ label: value, value: value, category: SHIP_TYPES.OTHER.label });
	});

	return options;
};
