import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import {
	Member,
	type MemberProps,
} from "@/domain/identity/enterprise/entities/member";

export async function makeMember(
	override: Partial<MemberProps> = {},
	id?: UniqueEntityID,
) {
	const member = Member.create(
		{
			userId: new UniqueEntityID(),
			organizationId: new UniqueEntityID(),
			role: 'MEMBER',
			...override,
		},
		id,
	);

	return member;
}
