import type { Readable } from 'node:stream';

export interface UploadParams {
	fileName: string;
	fileType: string;
	body: Readable;
}

export interface Uploader {
	upload(params: UploadParams): Promise<{ url: string }>;
	uploadAvatar(params: UploadParams): Promise<{ url: string }>;
}
