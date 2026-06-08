import { PrismaMembersRepository } from '@/infra/database/prisma/repositories/prisma-members-repository';
import { PrismaUsersRepository } from '@/infra/database/prisma/repositories/prisma-users-repository';
import { ListUserOrganizationsUseCase } from '../list-user-organizations';

export function makeListUserOrganizationsUseCase() {
	const usersRepository = new PrismaUsersRepository();
	const membersRepository = new PrismaMembersRepository();

	const listUserOrganizationsUseCase = new ListUserOrganizationsUseCase(
		usersRepository,
		membersRepository,
	);

	return listUserOrganizationsUseCase;
}
