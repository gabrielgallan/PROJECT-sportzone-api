import fastifySwagger from "@fastify/swagger";
import ScalarApiReference from "@scalar/fastify-api-reference";
import fastify from "fastify";
import {
	jsonSchemaTransform,
	serializerCompiler,
	validatorCompiler,
	ZodTypeProvider,
} from "fastify-type-provider-zod";
import z from "zod";
// import fastifyJwt from '@fastify/jwt'
// import fastifyCookies from '@fastify/cookie'
// import env from './infra/env/config.ts'
// import { ZodError } from 'zod'
// import { userRoutes } from './infra/http/controllers/users/routes.ts'
// import { courtRoutes } from './infra/http/controllers/courts/routes.ts'
// import { bookingsRoutes } from './infra/http/controllers/bookings/routes.ts'
// import fastifyRawBody from 'fastify-raw-body'
// import { stripeWebhookRoutes } from './infra/http/controllers/webhooks/stripe/route.ts'

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);

app.setValidatorCompiler(validatorCompiler);

app.register(fastifySwagger, {
	openapi: {
		info: {
			title: "Sportzone API",
			version: "1.0.0",
		},
	},
	transform: jsonSchemaTransform,
});

await app.register(ScalarApiReference, {
	routePrefix: "/reference",
	configuration: {
		theme: "elysiajs",
	},
});

// app.register(fastifyJwt, {
//     secret: env.JWT_SECRET,
//     cookie: {
//         cookieName: 'refreshToken',
//         signed: false
//     },
//     sign: {
//         expiresIn: '10m',
//     }
// })

// app.register(fastifyCookies)

// app.register(fastifyRawBody, {
//     field: 'rawBody',
//     global: false,
//     encoding: 'utf8'
// })

// app.register(userRoutes)
// app.register(courtRoutes)
// app.register(bookingsRoutes)

// app.register(stripeWebhookRoutes)

// app.setErrorHandler((error, request, reply) => {
//     if (error instanceof ZodError) {
//         return reply.status(400)
//             .send({ message: 'Data validation error!', issues: error.format() })
//     }

//     if (env.NODE_ENV !== 'production') {
//         console.error(error)
//     } else {
//         // Here i should send log to an external toll like DataDog/Sentry
//     }

//     return reply.status(500).send({ message: 'Internal Server Error' })
// })

export default app;
