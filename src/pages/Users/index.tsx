import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { AppButton, AppCard, AppSelect, Input } from '~components/atoms';
import { UsersTable } from '~components/organisms';
import { useCreateUser, useGetRoles, useUpdateUser } from '~hooks/users';
import { usersQueryKey } from '~hooks/users/key';
import { useTranslation } from '~i18n';
import { UserDTO } from '~services/users/types';
import styles from './Users.module.css';

const createUserSchema = z.object({
	id: z.string().optional(),
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	email: z.string().email(),
	password: z.string().min(1),
	roleId: z.string().uuid(),
});

const updateUserSchema = createUserSchema.partial();

export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

const defaultCreateUserValues: CreateUser = {
	email: '',
	firstName: '',
	lastName: '',
	password: '',
	roleId: '',
};

type UserFormType = 'CREATE' | 'UPDATE';

export const UsersPage = () => {
	const t = useTranslation();
	const [formType, setFormType] = useState<UserFormType>('CREATE');
	const { control, reset, handleSubmit } = useForm<CreateUser | UpdateUser, UserFormType>({
		resolver: (data, context, options) => {
			console.log({ data, context, options, formType });

			const isCreateUser = context === 'CREATE';

			if (!isCreateUser && data.password === '') {
				console.warn('[Delete password] ...');
				delete data.password;
			}

			return zodResolver(isCreateUser ? createUserSchema : updateUserSchema)(data, context, options);
		},
		defaultValues: defaultCreateUserValues,
		mode: 'onBlur',
		context: formType,
	});
	const queryClient = useQueryClient();

	const handleReset = () => {
		setFormType('CREATE');
		reset(defaultCreateUserValues);
	};

	const { data: roles } = useGetRoles();

	const handleUserRowClick = (user?: UserDTO) => {
		if (user === undefined) {
			return;
		}

		setFormType('UPDATE');
		const { role, ...userData } = user;
		reset({ ...userData, password: '', roleId: role.id });
	};

	const onCreateUserSuccess = () => {
		handleReset();
		queryClient.invalidateQueries({ queryKey: usersQueryKey() });
	};

	const { mutate: createUser } = useCreateUser(onCreateUserSuccess);
	const { mutate: updateUser } = useUpdateUser(onCreateUserSuccess);

	const onSubmit: SubmitHandler<CreateUser | UpdateUser> = useCallback(
		(data) => {
			if (formType === 'CREATE') {
				createUser(data as CreateUser);
				return;
			}

			updateUser(data);
		},
		[formType]
	);

	return (
		<div className={styles.wrapper}>
			<AppCard
				title={t('common.manageUsers')}
				className={styles.usersTable}
				contentContainerClassName={styles.usersTableContainer}
			>
				<UsersTable onRowClick={handleUserRowClick} />
			</AppCard>

			<AppCard title={t(`common.${formType === 'CREATE' ? 'addUser' : 'editUser'}`)} className={styles.createUserForm}>
				<form className={styles.container} onSubmit={handleSubmit(onSubmit)} onReset={handleReset}>
					<Controller
						name="firstName"
						control={control}
						render={({ field, fieldState }) => (
							<Input
								muiLabel={t('form.firstName.label')}
								className={styles.input}
								error={fieldState.error}
								{...field}
							/>
						)}
					/>

					<Controller
						name="lastName"
						control={control}
						render={({ field, fieldState }) => (
							<Input muiLabel={t('form.lastName.label')} className={styles.input} error={fieldState.error} {...field} />
						)}
					/>

					<Controller
						name="password"
						control={control}
						render={({ field, fieldState }) => (
							<Input muiLabel={t('form.password.label')} className={styles.input} error={fieldState.error} {...field} />
						)}
					/>

					<Controller
						name="email"
						control={control}
						render={({ field, fieldState }) => (
							<Input muiLabel={t('form.email.label')} className={styles.input} error={fieldState.error} {...field} />
						)}
					/>

					<Controller
						name="roleId"
						control={control}
						render={({ field, fieldState }) => (
							<AppSelect
								muiLabel={t('form.role.label')}
								className={styles.input}
								error={fieldState.error}
								options={roles?.map(({ id, code }) => ({
									label: code,
									value: id,
								}))}
								{...field}
							/>
						)}
					/>

					<AppButton value={t('common.submit')} type="submit" className={styles.submitButton} />

					<AppButton value={t('common.reset')} type="reset" variant="outlined" />
				</form>
			</AppCard>
		</div>
	);
};
