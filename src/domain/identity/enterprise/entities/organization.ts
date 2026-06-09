import { Entity } from "@/core/entities/entity";
import type { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { Optional } from "@/core/types/optional";
import { Slug } from "./value-objects/slug";

export interface OrganizationProps {
	ownerId: UniqueEntityID;
	name: string;
	slug: Slug;
	avatarUrl?: string | null;
	createdAt: Date;
	updatedAt?: Date | null;
}

export class Organization extends Entity<OrganizationProps> {
	static create(
		props: Optional<OrganizationProps, "createdAt" | "slug">,
		id?: UniqueEntityID,
	) {
		const organization = new Organization(
			{
				...props,
				slug: props.slug ?? Slug.createFromText(props.name),
				createdAt: props.createdAt ?? new Date(),
			},
			id,
		);

		return organization;
	}

	// Getters
	get ownerId() {
		return this.props.ownerId;
	}

	get name() {
		return this.props.name;
	}
	get slug() {
		return this.props.slug;
	}
	get avatarUrl() {
		return this.props.avatarUrl;
	}

	get createdAt() {
		return this.props.createdAt;
	}

	get updatedAt() {
		return this.props.updatedAt;
	}

	// Setters
	set name(name: string) {
		this.props.name = name;

		this.props.slug = Slug.createFromText(name);

		this.touch();
	}

	set avatarUrl(url: string | null | undefined) {
		this.props.avatarUrl = url;

		this.touch();
	}

	// Methods
	private touch() {
		this.props.updatedAt = new Date();
	}

	transferOwnership(ownerId: UniqueEntityID) {
		this.props.ownerId = ownerId;

		this.touch();
	}
}
