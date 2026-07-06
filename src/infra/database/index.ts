import { prisma } from './prisma/prisma';
import { PrismaAccountsRepository } from './prisma/repositories/prisma-accounts-repository';
import { PrismaBookingsRepository } from './prisma/repositories/prisma-bookings-repository';
import { PrismaCourtImagesRepository } from './prisma/repositories/prisma-court-images-repository';
import { PrismaCourtOpeningHoursRepository } from './prisma/repositories/prisma-court-opening-hours-repository';
import { PrismaCourtSportsRepository } from './prisma/repositories/prisma-court-sports-repository';
import { PrismaCourtsRepository } from './prisma/repositories/prisma-courts-repository';
import { PrismaCustomersRepository } from './prisma/repositories/prisma-customers-repository';
import { PrismaImagesRepository } from './prisma/repositories/prisma-images-repository';
import { PrismaInvitesRepository } from './prisma/repositories/prisma-invites-repository';
import { PrismaMembersRepository } from './prisma/repositories/prisma-members-repository';
import { PrismaNotificationsRepository } from './prisma/repositories/prisma-notifications-repository';
import { PrismaOrganizationsRepository } from './prisma/repositories/prisma-organizations-repository';
import { PrismaReviewsRepository } from './prisma/repositories/prisma-reviews-repository';
import { PrismaSportsRepository } from './prisma/repositories/prisma-sports-repository';
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
	notifications: new PrismaNotificationsRepository(),
	bookings: new PrismaBookingsRepository(),
	courts: new PrismaCourtsRepository(),
	courtImages: new PrismaCourtImagesRepository(),
	courtSports: new PrismaCourtSportsRepository(),
	courtOpeningHours: new PrismaCourtOpeningHoursRepository(),
	customers: new PrismaCustomersRepository(),
	images: new PrismaImagesRepository(),
	reviews: new PrismaReviewsRepository(),
	sports: new PrismaSportsRepository(),
};

export { repositories, services };
