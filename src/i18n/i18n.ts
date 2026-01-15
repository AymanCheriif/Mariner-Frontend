import enMessages from './locales/en.json';
import { Language } from './types';

// eslint-disable-next-line no-restricted-imports
import type { i18n as i18nApi, Resource } from 'i18next';
// eslint-disable-next-line no-restricted-imports
import i18next from 'i18next';
// eslint-disable-next-line no-restricted-imports
import { initReactI18next } from 'react-i18next';

const defaultNS = 'translation';
const defaultLanguage = Language.EN;

const resources: Resource = {
	en: { [defaultNS]: enMessages },
};

const i18nInitializer = (): i18nApi => {
	void i18next.use(initReactI18next).init({
		lng: defaultLanguage,
		defaultNS,
		resources,
		debug: false, // isDevelopment,
		load: 'languageOnly',
		saveMissing: true,
		returnEmptyString: false,
		missingKeyNoValueFallbackToKey: false,
		react: {
			useSuspense: false,
		},
		interpolation: {
			escapeValue: false,
		},
	});

	return i18next;
};
const i18n = i18nInitializer();

export const changeLanguage = (lng: Language): void => {
	void i18n.changeLanguage(lng);
};

export default i18n;
