import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { InvalidImageTypeError } from '@/domain/booking/application/use-cases/errors/invalid-image-type-error';
import { makeUploadImageUseCase } from '@/domain/booking/application/use-cases/factories/make-upload-and-create-image-use-case';
import { BadRequestError } from '../../errors/bad-request-error';
import { httpErrorSchema } from '../../errors/types/http-error';

export function uploadImageController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().post(
		'/images',
		{
			schema: {
				summary: 'Upload images',
				tags: ['booking'],
				consumes: ['multipart/form-data'],
				response: {
					201: z.object({
						image: z.object({
							id: z.string(),
							link: z.url(),
						}),
					}),
					400: httpErrorSchema,
				},
			},
		},
		async (request, reply) => {
			const uploadImage = makeUploadImageUseCase();

			const data = await request.file();

			if (!data) {
				throw new BadRequestError('File part missing!');
			}

			const result = await uploadImage.execute({
				fileName: data.filename,
				fileType: data.mimetype,
				body: data.file,
			});

			if (result.isLeft()) {
				const error = result.value;

				switch (error.constructor) {
					case InvalidImageTypeError:
						throw new BadRequestError(error.message);

					default:
						throw error;
				}
			}

			reply.status(201).send({
				image: {
					id: result.value.image.id.toString(),
					link: result.value.image.url,
				},
			});
		},
	);
}
