import { FC, useEffect } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { AppCard, Input } from '~components/atoms';
import { useTranslation } from '~i18n';
import { AddOurShipRequest } from '~pages/MainForms/AddOurShip/addOurShipSchema';
import styles from './ShipPersonnelContactForm.module.css';

type AllowedFormNameParentPath = keyof Pick<AddOurShipRequest, 'shipOwner' | 'chartingDepart' | 'operationDepart'>;

interface Props {
  title: string;
  formName: AllowedFormNameParentPath;
}

export const UpdateShipPersonnelContactForm: FC<Props> = ({ title, formName }) => {
  const t = useTranslation();
  const { control, formState, setValue, getValues } = useFormContext<AddOurShipRequest>();
  const isFormError = formState.errors[formName] !== undefined;

  // Watch the entire contact object for changes (explicitly pass control)
  const contact = useWatch({ control, name: formName });

  // Ensure fields get populated from form state (especially right after reset with fetched data)
  useEffect(() => {
    const current = getValues(formName) as AddOurShipRequest[typeof formName] | undefined;
    if (current) {
      setValue(`${formName}.name`, current.name ?? '', { shouldDirty: false, shouldValidate: false });
      setValue(`${formName}.phoneNumber`, current.phoneNumber ?? '', { shouldDirty: false, shouldValidate: false });
      setValue(`${formName}.whatsAppNumber`, current.whatsAppNumber ?? '', { shouldDirty: false, shouldValidate: false });
      setValue(`${formName}.wechatNumber`, current.wechatNumber ?? '', { shouldDirty: false, shouldValidate: false });
    }
  }, [contact, formName, getValues, setValue]);

  return (
    <AppCard title={title} isError={isFormError}>
      <Controller
        name={`${formName}.name`}
        control={control}
        defaultValue=""
        render={({ field, fieldState }) => (
          <Input muiLabel={t('form.name.label')} className={styles.input} error={fieldState.error} {...field} value={field.value ?? ''} />
        )}
      />

      <Controller
        name={`${formName}.phoneNumber`}
        control={control}
        defaultValue=""
        render={({ field, fieldState }) => (
          <Input muiLabel={t('form.phoneNumber.label')} className={styles.input} error={fieldState.error} {...field} value={field.value ?? ''} />
        )}
      />

      <Controller
        name={`${formName}.whatsAppNumber`}
        control={control}
        defaultValue=""
        render={({ field, fieldState }) => (
          <Input
            muiLabel={t('form.whatsAppNumber.label')}
            className={styles.input}
            error={fieldState.error}
            {...field}
            value={field.value ?? ''}
          />
        )}
      />

      <Controller
        name={`${formName}.wechatNumber`}
        control={control}
        defaultValue=""
        render={({ field, fieldState }) => (
          <Input muiLabel={t('form.weChatNumber.label')} className={styles.input} error={fieldState.error} {...field} value={field.value ?? ''} />
        )}
      />
    </AppCard>
  );
};
