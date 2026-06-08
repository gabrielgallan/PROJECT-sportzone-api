import { PrismaMembersRepository } from '@/infra/database/prisma/repositories/prisma-members-repository';
import { PrismaOrganizationsRepository } from '@/infra/database/prisma/repositories/prisma-organizations-repository';
import { PrismaUsersRepository } from '@/infra/database/prisma/repositories/prisma-users-repository';
import { CreateOrganizationUseCase } from '../create-organization';

export function makeCreateOrganizationUseCase() {
	const usersRepository = new PrismaUsersRepository();
	const organizationsRepository = new PrismaOrganizationsRepository();
	const membersRepository = new PrismaMembersRepository();

	const createOrganizationUseCase = new CreateOrganizationUseCase(
		usersRepository,
		organizationsRepository,
		membersRepository,
	);

	return createOrganizationUseCase;
}
