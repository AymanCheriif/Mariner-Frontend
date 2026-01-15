// https://stackoverflow.com/questions/45194598/using-process-env-in-typescript

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DIST: string;
			VITE_PUBLIC: string;
			VITE_DEV_SERVER_URL: string;

			// APP ENV
			readonly VITE_API_BASE_URL: string;
		}
	}
}

export {};
