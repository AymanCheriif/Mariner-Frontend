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
      setValue(`${formName}.email`, current.email ?? '', { shouldDirty: false, shouldValidate: false });
      setValue(`${formName}.phoneFixe`, current.phoneFixe ?? '', { shouldDirty: false, shouldValidate: false });
      setValue(`${formName}.phoneMobile`, current.phoneMobile ?? '', { shouldDirty: false, shouldValidate: false });
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
        name={`${formName}.email`}
        control={control}
        defaultValue=""
        render={({ field, fieldState }) => (
          <Input muiLabel={t('form.email.label')} className={styles.input} error={fieldState.error} {...field} value={field.value ?? ''} />
        )}
      />

      <Controller
        name={`${formName}.phoneFixe`}
        control={control}
        defaultValue=""
        render={({ field, fieldState }) => (
          <Input muiLabel={t('form.phoneFixe.label')} className={styles.input} error={fieldState.error} {...field} value={field.value ?? ''} />
        )}
      />

      <Controller
        name={`${formName}.phoneMobile`}
        control={control}
        defaultValue=""
        render={({ field, fieldState }) => (
          <Input muiLabel={t('form.phoneMobile.label')} className={styles.input} error={fieldState.error} {...field} value={field.value ?? ''} />
        )}
      />
    </AppCard>
  );
};
