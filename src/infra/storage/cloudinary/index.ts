import { v2 } from 'cloudinary';
import { env } from '@/infra/env';

v2.config({
	cloud_name: env.CLOUDINARY_CLOUD_NAME,
	api_key: env.CLOUDINARY_API_KEY,
	api_secret: env.CLOUDINARY_API_SECRET,
});

export { v2 }
