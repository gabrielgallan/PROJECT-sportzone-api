import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { makeUploadAvatarUseCase } from '@/domain/identity/application/use-cases/factories/make-upload-avatar-use-case';
import { BadRequestError } from '../errors/bad-request-error';
import { httpErrorSchema } from '../errors/types/http-error';

export function uploadAvatarController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().put(
		'/profile/avatar',
		{
			schema: {
				summary: 'Upload avatar',
				tags: ['profile'],
				security: [{ bearerAuth: [] }],
				consumes: ['multipart/form-data'],
				response: {
					204: z.null(),
					400: httpErrorSchema,
					502: httpErrorSchema
				},
			},
		},
		async (request, reply) => {
			const userId = await request.getUserId();

			const data = await request.file();

			if (!data) {
				throw new BadRequestError('File part missing!');
			}

			const uploadAvatar = makeUploadAvatarUseCase();

			await uploadAvatar.execute({
				userId,
				fileName: data.filename,
				fileType: data.mimetype,
				body: data.file,
			});

			reply.status(204);
		},
	);
}
