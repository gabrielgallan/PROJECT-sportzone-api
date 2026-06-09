import { repositories } from '@/infra/database';
import { TransferOwnershipUseCase } from '../transfer-ownership';

export function makeTransferOwnershipUseCase() {
	const transferOwnershipUseCase = new TransferOwnershipUseCase(
		repositories.users,
		repositories.members,
		repositories.organizations,
	);

	return transferOwnershipUseCase;
}
