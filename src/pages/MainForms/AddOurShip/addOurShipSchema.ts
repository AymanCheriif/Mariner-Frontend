import { z } from 'zod';

/** ######################## Add Ship ######################## */
const dateLike = z
	.date()
	.nullable()
	.refine((value) => value !== null, {
		message: 'date must follow the format YYYY-MM-DD',
	});

const optionalDateLike = z.date().nullable().optional();

const optionalEmail = z.union([z.literal(''), z.string().email()]);

const addShipSchema = z.object({
	shipName: z.string().min(1),
	shipImo: z.string().min(7).max(7),
	dwt: z.string().min(1),
	shipType: z.string().optional(),
	boardingPort: z.string().min(1),
	berthingDate: dateLike,
	shipStatus: z.string().min(1),
	provenance: z.string().min(1),
	agent: z.string().optional(),
});

// Special schema for fleet where the removed fields are optional
const addFleetShipSchema = z.object({
	shipName: z.string().min(1),
	shipImo: z.string().min(7).max(7),
	dwt: z.string().min(1),
	shipType: z.string().optional(),
	boardingPort: z.string().min(1),
	berthingDate: optionalDateLike,
	shipStatus: z.string().optional(),
	provenance: z.string().optional(),
	agent: z.string().optional(),
});

const addPersonnelContactSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	phoneNumber: z.string(), // TODO: add phone numebr validations
	whatsAppNumber: z.string(),
	wechatNumber: z.string(),
});

/** ######################## Cargo ######################## */
const cargaisonTypes = z.enum(['cargaison', 'container']);

type CargaisonTypes = z.infer<typeof cargaisonTypes>;

const addCargaisonSchema = z.object({
	// Preserve backend id when updating
	id: z.string().uuid().optional(),
	type: cargaisonTypes,
	category: z.string().min(1),
	subCategory: z.string().min(1),
	tonnage: z.string(),
	// Receiver fields
	receiverId: z.string().optional(), // For selecting existing receiver
	receiverMIC: z.string().optional(),
	receiverName: z.string(),
	receiverEmail: optionalEmail,
	receiverPhoneMobile: z.string().optional(),
	// Fournisseur fields
	fournisseurId: z.string().optional(), // For selecting existing fournisseur
	fournisseurMIC: z.string().optional(),
	fournisseurName: z.string(),
	fournisseurEmail: optionalEmail,
	fournisseurPhoneFixe: z.string().optional(),
	fournisseurPhoneMobile: z.string().optional(),
	// Legacy fields (kept for backward compatibility)
	phoneNumber: z.string(),
	whatsAppNumber: z.string(),
	email: optionalEmail,
});

const MAX_UPLOADED_FILES = 7;
const FILE_SIZE_LIMIT = 2;
const FILE_SIZE_LIMIT__IN_BYTE = FILE_SIZE_LIMIT * 1024 * 1024; // 2MB
const ALLOWED_FILE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'application/pdf'];

const documentSchema = z
	.instanceof(File)
	.refine((file) => ALLOWED_FILE_MIME_TYPES.includes(file.type), {
		message: `Invalid file type. Allowed types: ${ALLOWED_FILE_MIME_TYPES.map((s) => s.split('/')[1]).join(', ')}`,
	})
	.refine((file) => file.size <= FILE_SIZE_LIMIT__IN_BYTE, {
		message: `File size should not exceed ${FILE_SIZE_LIMIT}MB`,
	});

export type Document = z.infer<typeof documentSchema>;

const documentsArraySchema = z.array(documentSchema).max(MAX_UPLOADED_FILES);

const addDocumentsSchema = z.object({
	ship: documentsArraySchema,
	charter: documentsArraySchema,
	receiver: documentsArraySchema,
});

/** ######################## Ship ######################## */
const addOurShipSchema = z.object({
	addShip: addShipSchema,
	// cargaison
	cargoes: z.array(addCargaisonSchema),
	shipOwner: addPersonnelContactSchema,
	operationDepart: addPersonnelContactSchema,
	chartingDepart: addPersonnelContactSchema,
	// documentation:
	documents: addDocumentsSchema,
	// Existing document preview IDs (update mode)
	shipDocuments: z.array(z.string()).optional(),
	charterDocuments: z.array(z.string()).optional(),
	receiverDocuments: z.array(z.string()).optional(),
	// Remarks
	remarksAndFacts: z.string(),
	performanceRate: z.string(),
});

// Special schema for fleet ships
const addFleetShipFormSchema = z.object({
	addShip: addFleetShipSchema,
	// cargaison - optional for fleets
	cargoes: z.array(addCargaisonSchema).optional().default([]),
	shipOwner: addPersonnelContactSchema,
	operationDepart: addPersonnelContactSchema,
	chartingDepart: addPersonnelContactSchema,
	// documentation:
	documents: addDocumentsSchema,
	// Existing document preview IDs (update mode)
	shipDocuments: z.array(z.string()).optional(),
	charterDocuments: z.array(z.string()).optional(),
	receiverDocuments: z.array(z.string()).optional(),
	// Remarks
	remarksAndFacts: z.string(),
	performanceRate: z.string().optional().default(''),
});

type AddOurShipRequest = z.infer<typeof addOurShipSchema>;

/** ######################## Default Values ######################## */
const defaultPersonnelContactFormValues: AddOurShipRequest['shipOwner'] = {
	name: '',
	phoneNumber: '',
	wechatNumber: '',
	whatsAppNumber: '',
};

const defaultCargaisonValues: AddOurShipRequest['cargoes'][number] = {
	// id omitted by default for new cargo
	type: '' as CargaisonTypes, // Default value to make user pick
	category: '',
	subCategory: '',
	tonnage: '',
	// Receiver fields
	receiverId: undefined,
	receiverMIC: '',
	receiverName: '',
	receiverEmail: '',
	receiverPhoneMobile: '',
	// Fournisseur fields
	fournisseurId: undefined,
	fournisseurMIC: '',
	fournisseurName: '',
	fournisseurEmail: '',
	fournisseurPhoneFixe: '',
	fournisseurPhoneMobile: '',
	// Legacy fields
	phoneNumber: '',
	whatsAppNumber: '',
	email: '',
};

const defaultAddOurShipFormValues: AddOurShipRequest = {
	addShip: {
		shipName: '',
		shipImo: '',
		dwt: '',
		shipType: '',
		boardingPort: '',
		berthingDate: new Date(),
		shipStatus: '',
		provenance: '',
		agent: 'NAVLION',
	},
	cargoes: [],
	shipOwner: defaultPersonnelContactFormValues,
	operationDepart: defaultPersonnelContactFormValues,
	chartingDepart: defaultPersonnelContactFormValues,
	documents: {
		ship: [],
		charter: [],
		receiver: [],
	},
	// preview IDs default empty
	shipDocuments: [],
	charterDocuments: [],
	receiverDocuments: [],
	remarksAndFacts: '',
	performanceRate: '',
};

export {
	addCargaisonSchema,
	addOurShipSchema,
	addFleetShipFormSchema,
	defaultAddOurShipFormValues,
	defaultCargaisonValues,
	type AddOurShipRequest,
};
