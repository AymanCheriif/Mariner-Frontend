import { z } from 'zod';

const loginSchema = z.object({
	email: z.string().min(1, 'Username or email is required'),
	password: z.string().min(1),
	isRememberMe: z.boolean().default(false),
});

type LoginRequest = z.infer<typeof loginSchema>;

const defaultLoginFormValues: LoginRequest = {
	email: '',
	password: '',
	isRememberMe: false,
};

export { defaultLoginFormValues, loginSchema, type LoginRequest };
