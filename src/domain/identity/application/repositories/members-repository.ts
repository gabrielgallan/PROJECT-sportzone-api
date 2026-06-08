import type { Pagination } from "@/core/types/pagination";
import type { Member } from "../../enterprise/entities/member";
import type { MemberWithProfile } from "../../enterprise/entities/value-objects/member-with-profile";

export interface MembersRepository {
	create(member: Member): Promise<void>;
	listByOrganizationId(
		organizationId: string,
		pagination: Pagination,
	): Promise<MemberWithProfile[]>;
	findById(memberId: string): Promise<Member | null>;
	findManyByUserId(userId: string): Promise<Member[]>;
	findByUserIdAndOrganizationId(
		userId: string,
		organizationId: string,
	): Promise<Member | null>;
	save(member: Member): Promise<void>;
	delete(member: Member): Promise<void>;
}
