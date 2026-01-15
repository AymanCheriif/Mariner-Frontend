import enMessagesJson from "./locales/en.json";
import type { TranslationJsonType } from "./types";

// eslint-disable-next-line no-restricted-imports
import type { ResourceLanguage } from "i18next";

const translationBuffer: ResourceLanguage = {};

const loadKeysAsObject = (json: ResourceLanguage, objToConvertTo = translationBuffer, current?: string): void => {
	Object.keys(json).forEach((key) => {
		const currentLookupKey = current ? `${current}.${key}` : String(key);
		if (typeof json[key] === "object") {
			objToConvertTo[key] = {};
			loadKeysAsObject(json[key] as ResourceLanguage, objToConvertTo[key] as ResourceLanguage, currentLookupKey);
		} else {
			objToConvertTo[key] = currentLookupKey;
		}
	});
};

const getTranslations = () => {
	if (Object.keys(translationBuffer).length === 0) loadKeysAsObject(enMessagesJson);
	return translationBuffer;
};
const i18Key = getTranslations() as TranslationJsonType;

export default i18Key;
