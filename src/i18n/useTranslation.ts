import type { TranslationOptions, TxKeyPath } from "./types";

// eslint-disable-next-line no-restricted-imports
import type { TOptions } from "i18next";
// eslint-disable-next-line no-restricted-imports
import { useTranslation as _useTranslation } from "react-i18next";

export type InterpolationValue = TOptions;
export type UseTranslateReturnType = (id: TxKeyPath, values?: InterpolationValue, defaultMessage?: string) => string;

export const useTranslation = (options?: TranslationOptions): UseTranslateReturnType => {
	const { t: _translate } = _useTranslation(options?.nameSpace ?? "translation", {
		useSuspense: options?.useSuspense ?? false,
		keyPrefix: options?.keyPrefix,
	});

	return (id, values, defaultMessage = "") => _translate(id, defaultMessage, { ...values });
};
