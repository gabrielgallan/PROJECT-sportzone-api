import { z } from 'zod';

const httpErrorSchema = z.object({ message: z.string() });

type HttpErrorType = z.infer<typeof httpErrorSchema>;

export { type HttpErrorType, httpErrorSchema };
