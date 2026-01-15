/// <reference types="vite/client" />

interface ImportMetaEnv {
	// VITE DEFAULT ENV
	readonly VITE_APP_TITLE: string;
	readonly DIST: string;
	readonly VITE_PUBLIC: string;
	readonly VITE_DEV_SERVER_URL: string;

	// APP ENV
	readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}