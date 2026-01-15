import type EnJson from "./locales/en.json";
export enum Language {
	EN = "en",
}

export type TranslationJsonType = typeof EnJson;

type DefaultLocale = typeof EnJson;

export type RecursiveKeyOf<TObj extends Record<string, unknown>> = {
	[TKey in keyof TObj & (number | string)]: TObj[TKey] extends unknown[]
		? `${TKey}`
		: TObj[TKey] extends Record<string, unknown>
			? `${TKey}.${RecursiveKeyOf<TObj[TKey]>}`
			: `${TKey}`;
}[keyof TObj & (number | string)];

export type TxKeyPath = RecursiveKeyOf<DefaultLocale>;

export interface TranslationOptions {
	nameSpace?: string;
	useSuspense?: boolean;
	keyPrefix?: string;
}
