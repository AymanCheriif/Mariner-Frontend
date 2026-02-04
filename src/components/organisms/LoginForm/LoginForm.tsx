import { CircularProgress } from '@mui/material';
import { Controller } from 'react-hook-form';
import { AppButton, AppCheckbox, Input } from '~components/atoms';
import { useTranslation } from '~i18n';
import styles from './LoginForm.module.css';
import { useLogin } from './useLogin';

export const LoginForm = () => {
	const t = useTranslation();
	const { control, isSubmitDisabled, onSubmit, isLoginRequestLoading } = useLogin();

	return (
		<form className={styles.form} onSubmit={onSubmit}>
			<Controller
				name="email"
				control={control}
				render={({ field, fieldState }) => (
					<Input
						label="Username or Email"
						placeholder="Enter username or email"
						type="text"
						error={fieldState.error}
						{...field}
					/>
				)}
			/>

			<Controller
				name="password"
				control={control}
				render={({ field, fieldState }) => (
					<Input
						label={t('form.password.label')}
						placeholder={t('form.password.label')}
						type="password"
						error={fieldState.error}
						{...field}
					/>
				)}
			/>

			<Controller
				name="isRememberMe"
				control={control}
				render={({ field }) => <AppCheckbox label={t('form.keepSignedIn')} {...field} />}
			/>

			<AppButton
				value={isLoginRequestLoading ? '' : t('common.continue')}
				type="submit"
				startIcon={isLoginRequestLoading && <CircularProgress size={30} />}
				disabled={isSubmitDisabled}
			/>
		</form>
	);
};
