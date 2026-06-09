import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { makeUploadAvatarUseCase } from '@/domain/identity/application/use-cases/factories/make-upload-avatar-use-case';
import { BadRequestError } from '../errors/bad-request-error';

export function uploadAvatarController(app: FastifyInstance) {
	app.withTypeProvider<ZodTypeProvider>().patch(
		'/profile/avatar',
		{
			schema: {
				summary: 'Upload avatar',
				tags: ['profile'],
				security: [{ bearerAuth: [] }],
				consumes: ['multipart/form-data'],
				response: {
					204: z.null(),
					400: z.object({ message: z.string() }),
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
