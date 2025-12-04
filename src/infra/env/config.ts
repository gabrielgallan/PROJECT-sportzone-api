import 'dotenv/config'
import z from 'zod'

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string(),
    LOCATIONIQ_API_KEY: z.string(),
    JWT_SECRET: z.string(),
    STRIPE_SECRET_API_KEY: z.string(),
    STRIPE_WEBHOOK_SECRET: z.string(),
    FRONT_END_URL: z.string().nullable()
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
    const errors = _env.error.format()
    console.error('Invalid enviroment variable!', errors)

    process.exit(1)
}

const env = _env.data

export default env