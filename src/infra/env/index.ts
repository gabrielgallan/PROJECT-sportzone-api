import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	PORT: z.coerce.number().default(3000),
	DATABASE_URL: z.url(),
	JWT_SECRET: z.string(),

	GITHUB_OAUTH_CLIENT_ID: z.string(),
	GITHUB_OAUTH_CLIENT_SECRET: z.string(),
	GITHUB_OAUTH_CLIENT_REDIRECT_URI: z.string(),

	GOOGLE_OAUTH_CLIENT_ID: z.string(),
	GOOGLE_OAUTH_CLIENT_SECRET: z.string(),
	GOOGLE_OAUTH_CLIENT_REDIRECT_URI: z.string(),

	RESEND_API_KEY: z.string(),

	WEB_URL: z.string(),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
	const errors = _env.error.format();
	console.error('Invalid enviroment variable!', errors);

	process.exit(1);
}

const env = _env.data;

export { env };
