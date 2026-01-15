import dayjs from 'dayjs';
import { ShipDTO } from '~services/addShip/types';
import { AddOurShipRequest } from '../AddOurShip/addOurShipSchema';

const mapShipPersonnelFormToDTO = (form: AddOurShipRequest['shipOwner']): ShipDTO['shipOwner'] => {
	const isEmpty = (v: unknown) => v === '' || v === null || v === undefined;
	const allEmpty =
		isEmpty(form.name) && isEmpty(form.phoneNumber) && isEmpty(form.whatsAppNumber) && isEmpty(form.wechatNumber);
	if (allEmpty) {
		return null;
	}

	return {
		name: form.name ?? '',
		phoneNumber: form.phoneNumber ?? '',
		whatsAppNumber: form.whatsAppNumber ?? '',
		weChatNumber: form.wechatNumber ?? '',
	};
};

const getDocumentType = (type: string): ShipDTO['documents'][number]['type'] => {
	if (type === 'charter') {
		return 'CHARTER';
	}

	if (type === 'receiver') {
		return 'RECEIVER';
	}

	if (type !== 'ship') {
		console.warn("Uploaded document type is not supported, defaulting to 'SHIP'");
	}

	return 'SHIP';
};

const mapDocumentsToDocumentsDTO = (formDocuments: AddOurShipRequest['documents']): ShipDTO['documents'] => {
	return Object.entries(formDocuments).map(([type, documents]) => {
		return {
			type: getDocumentType(type),
			files: documents,
		};
	});
};

export const mapShipFormToShipDTO = (form: AddOurShipRequest): ShipDTO => {
	return {
		name: form.addShip.shipName,
		imo: form.addShip.shipImo,
		dwt: form.addShip.dwt,
		shipType: form.addShip.shipType,
		boardingPort: form.addShip.boardingPort,
		shipStatus: form.addShip.shipStatus,
		provenance: form.addShip.provenance,
		agent: form.addShip.agent,

		remarksAndFacts: form.remarksAndFacts,
		performanceRate: form.performanceRate,

		berthingDate: dayjs(form.addShip.berthingDate).toISOString(),
		completionDate: dayjs(form.addShip.completionDate).toISOString(),

		shipOwner: mapShipPersonnelFormToDTO(form.shipOwner),
		operationDepart: mapShipPersonnelFormToDTO(form.operationDepart),
		chartingDepart: mapShipPersonnelFormToDTO(form.chartingDepart),

		cargoes: form.cargoes,

		// Used only to map documents in frontend
		documents: mapDocumentsToDocumentsDTO(form.documents),

		// Received from API, contains UUID[]
		shipDocuments: [],
		receiverDocuments: [],
		charterDocuments: [],

		// isFleet will be set by the calling code based on context
		isFleet: false,
	};
};

// Reverse mapper: ShipDTO -> AddOurShipRequest (for update prefill)
export const mapShipDTOToAddOurShipForm = (dto: ShipDTO): AddOurShipRequest => {
	const mapContact = (c?: ShipDTO['shipOwner']) => ({
		name: c?.name ?? '',
		phoneNumber: c?.phoneNumber ?? '',
		whatsAppNumber: c?.whatsAppNumber ?? '',
		wechatNumber: c?.weChatNumber ?? '',
	});

	const toCargaisonType = (val?: string): 'cargaison' | 'container' => {
		return val === 'container' ? 'container' : 'cargaison';
	};

	return {
		addShip: {
			shipName: dto.name ?? '',
			shipImo: dto.imo ?? '',
			dwt: dto.dwt ?? '',
			shipType: dto.shipType ?? '',
			boardingPort: dto.boardingPort ?? '',
			berthingDate: dto.berthingDate ? new Date(dto.berthingDate) : new Date(),
			completionDate: dto.completionDate ? new Date(dto.completionDate) : new Date(),
			shipStatus: dto.shipStatus ?? '',
			provenance: dto.provenance ?? '',
			agent: dto.agent ?? '',
		},
		cargoes: (dto.cargoes ?? []).map((c) => ({
			id: c.id,
			type: toCargaisonType(c.type),
			category: c.category ?? '',
			subCategory: c.subCategory ?? '',
			tonnage: c.tonnage ?? '',
			// Receiver fields
			receiverName: c.receiverName ?? '',
			receiverEmail: c.receiverEmail ?? '',
			receiverPhoneFixe: c.receiverPhoneFixe ?? '',
			receiverPhoneMobile: c.receiverPhoneMobile ?? '',
			// Fournisseur fields
			fournisseurName: c.fournisseurName ?? '',
			fournisseurEmail: c.fournisseurEmail ?? '',
			fournisseurPhoneFixe: c.fournisseurPhoneFixe ?? '',
			fournisseurPhoneMobile: c.fournisseurPhoneMobile ?? '',
			// Legacy fields
			phoneNumber: c.phoneNumber ?? '',
			whatsAppNumber: c.whatsAppNumber ?? '',
			email: c.email ?? '',
		})),
		shipOwner: mapContact(dto.shipOwner ?? undefined),
		operationDepart: mapContact(dto.operationDepart ?? undefined),
		chartingDepart: mapContact(dto.chartingDepart ?? undefined),
		documents: {
			ship: [],
			charter: [],
			receiver: [],
		},
		// Populate preview IDs for update mode
		shipDocuments: dto.shipDocuments ?? [],
		charterDocuments: dto.charterDocuments ?? [],
		receiverDocuments: dto.receiverDocuments ?? [],
		remarksAndFacts: dto.remarksAndFacts ?? '',
		performanceRate: dto.performanceRate ?? '',
	};
};
