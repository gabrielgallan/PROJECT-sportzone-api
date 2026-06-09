import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { BadRequestError } from '../errors/bad-request-error';
import { makeUploadOrganizationAvatarUseCase } from '@/domain/identity/application/use-cases/factories/make-upload-organization-avatar-use-case';

export function uploadOrgAvatarController(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().patch(
        '/organizations/:organizationSlug/avatar',
        {
            schema: {
                summary: 'Upload org avatar',
                tags: ['org'],
                security: [{ bearerAuth: [] }],
                params: z.object({
                    organizationSlug: z.string()
                }),
                consumes: ['multipart/form-data'],
                response: {
                    204: z.null(),
                    400: z.object({ message: z.string() }),
                },
            },
        },
        async (request, reply) => {
            const userId = await request.getUserId();
            const { organizationSlug } = request.params

            const data = await request.file();

            if (!data) {
                throw new BadRequestError('File part missing!');
            }

            const uploadOrgAvatar = makeUploadOrganizationAvatarUseCase();

            await uploadOrgAvatar.execute({
                userId,
                organizationSlug,
                fileName: data.filename,
                fileType: data.mimetype,
                body: data.file,
            });

            reply.status(204);
        },
    );
}
