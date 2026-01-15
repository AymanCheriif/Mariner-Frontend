import i18n from './i18n';

import type { FC, PropsWithChildren } from 'react';
// eslint-disable-next-line no-restricted-imports
import { I18nextProvider } from 'react-i18next';

export const I18nProvider: FC<PropsWithChildren> = ({ children }) => (
	<I18nextProvider i18n={i18n}>{children}</I18nextProvider>
);
