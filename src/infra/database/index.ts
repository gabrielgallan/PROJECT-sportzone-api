import { prisma } from './prisma/prisma';
import { PrismaAccountsRepository } from './prisma/repositories/prisma-accounts-repository';
import { PrismaInvitesRepository } from './prisma/repositories/prisma-invites-repository';
import { PrismaMembersRepository } from './prisma/repositories/prisma-members-repository';
import { PrismaOrganizationsRepository } from './prisma/repositories/prisma-organizations-repository';
import { PrismaTokensRepository } from './prisma/repositories/prisma-tokens-repository';
import { PrismaUsersRepository } from './prisma/repositories/prisma-users-repository';

const services = {
	prisma,
};

const repositories = {
	users: new PrismaUsersRepository(),
	accounts: new PrismaAccountsRepository(),
	invites: new PrismaInvitesRepository(),
	members: new PrismaMembersRepository(),
	organizations: new PrismaOrganizationsRepository(),
	tokens: new PrismaTokensRepository(),
};

export { repositories, services };
