import type { FastifyInstance } from "fastify";
import type { Encrypter } from "@/domain/identity/application/cryptography/encrypter";

export class FastifyJwtEncrypter implements Encrypter {
	constructor(private readonly app: FastifyInstance) {}

	async encrypt(payload: Record<string, unknown>): Promise<string> {
		return this.app.jwt.sign(payload, {
			expiresIn: "7d",
		});
	}
}
