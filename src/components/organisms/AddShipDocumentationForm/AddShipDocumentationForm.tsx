import { FC } from 'react';
import { AppCard } from '~components/atoms';
import { useTranslation } from '~i18n';
import { DocumentationFormItem } from './components';

export const AddShipDocumentationForm: FC = () => {
	const t = useTranslation();

	return (
		<AppCard title={t('common.documentation')}>
			<DocumentationFormItem titleKey="common.ship" formName="documents.ship" />
			<DocumentationFormItem titleKey="common.fournisseur" formName="documents.charter" />
			<DocumentationFormItem titleKey="common.receiver" formName="documents.receiver" />
		</AppCard>
	);
};
