import { Readable } from 'node:stream';
import type { UploadApiResponse } from 'cloudinary';
import type { Uploader, UploadParams } from '@/domain/identity/application/storage/uploader';
import { BadGatewayError } from '@/infra/http/errors/bad-gateway-error';
import { v2 } from '.';

type UploadOptions = {
	folder: string;
	transformation?: object[];
	resource_type?: 'image' | 'video' | 'raw' | 'auto';
};

export class CloudinaryStorage implements Uploader {
	private async uploadToCloudinary(
		{ fileName, body }: UploadParams,
		options: UploadOptions,
	): Promise<{ url: string }> {
		try {
			const result = await new Promise<UploadApiResponse>((resolve, reject) => {
				const stream = v2.uploader.upload_stream(
					{
						public_id: fileName,
						resource_type: options.resource_type ?? 'image',
						folder: options.folder,
						transformation: options.transformation,
					},
					(error, result) => {
						if (error) return reject(error);
						if (!result) return reject(new Error('Upload failed'));
						resolve(result);
					},
				);

				Readable.from(body).pipe(stream);
			});

			return { url: result.secure_url };
		} catch (error: any) {
			throw new BadGatewayError(error.message ?? 'Cloudinary upload error');
		}
	}

	async uploadAvatar(params: UploadParams): Promise<{ url: string }> {
		return this.uploadToCloudinary(params, {
			folder: 'avatars',
			transformation: [{ width: 256, height: 256, crop: 'fill' }],
		});
	}

	async upload(params: UploadParams): Promise<{ url: string }> {
		return this.uploadToCloudinary(params, {
			folder: 'general',
			resource_type: 'auto', // aceita imagem, vídeo, etc
		});
	}
}
