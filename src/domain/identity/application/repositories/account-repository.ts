import type { Account } from "../../enterprise/entities/account";

export interface AccountRepository {
	create(account: Account): Promise<void>;
	findByProviderAndUserId(
		provider: string,
		userId: string,
	): Promise<Account | null>;
}
