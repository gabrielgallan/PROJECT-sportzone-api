import type { UsersRepository } from "@/domain/identity/application/repositories/users-repository";
import type { User } from "@/domain/identity/enterprise/entities/user";
import { prisma } from "..";
import { PrismaUserMapper } from "../mappers/prisma-user-mapper";

export class PrismaUsersRepository implements UsersRepository {
	async create(user: User) {
		const data = PrismaUserMapper.toPrisma(user);

		await prisma.user.create({
			data,
		});

		return;
	}

	async findById(id: string) {
		const user = await prisma.user.findUnique({
			where: { id },
		});

		if (!user) return null;

		return PrismaUserMapper.toDomain(user);
	}

	async findByEmail(email: string) {
		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user) return null;

		return PrismaUserMapper.toDomain(user);
	}

	async save(user: User) {
		const data = PrismaUserMapper.toPrisma(user);

		await prisma.user.update({
			data,
			where: {
				id: data.id,
			},
		});

		return;
	}
}
