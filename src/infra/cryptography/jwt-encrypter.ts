import type { Encrypter } from "@/domain/identity/application/cryptography/encrypter";

export class JwtEncrypter implements Encrypter {
	async encrypt(_payload: Record<string, unknown>) {}
}
