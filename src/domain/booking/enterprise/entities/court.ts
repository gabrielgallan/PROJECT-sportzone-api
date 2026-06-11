import { AggregatedRoot } from '@/core/entities/aggregate-root';
import type { UniqueEntityID } from '@/core/entities/unique-entity-id';
import type { Optional } from '@/core/types/optional';
import type { Cash } from '../../../../core/shared/value-objects/cash';
import type { CourtImage } from './court-image';
import type { CourtImagesList } from './court-images-list';

export type CourtStatus = 'IN_MAINTENANCE' | 'PAUSED' | 'PENDING' | 'ONLINE';

export interface CourtProps {
	organizationId: UniqueEntityID;
	name: string;
	description?: string | null;
	coverImage: CourtImage | null;

	address: string;
	latitude: number;
	longitude: number;

	images: CourtImagesList;

	status: CourtStatus;
	pricePerHour: Cash;
	createdAt: Date;
	updatedAt?: Date | null;
}

export class Court extends AggregatedRoot<CourtProps> {
	static create(
		props: Optional<CourtProps, 'createdAt' | 'status' | 'updatedAt' | 'description'>,
		id?: UniqueEntityID,
	) {
		const court = new Court(
			{
				...props,
				description: props.description ?? null,
				status: props.status ?? 'PENDING',
				createdAt: props.createdAt ?? new Date(),
				updatedAt: props.updatedAt ?? null,
			},
			id,
		);

		return court;
	}

	// => Getters
	get organizationId() {
		return this.props.organizationId;
	}

	get name() {
		return this.props.name;
	}

	get description() {
		return this.props.description;
	}

	get coverImage() {
		return this.props.coverImage;
	}

	get address() {
		return this.props.address;
	}

	get latitude() {
		return this.props.latitude;
	}

	get longitude() {
		return this.props.longitude;
	}

	get images() {
		return this.props.images;
	}

	get status() {
		return this.props.status;
	}

	get pricePerHour() {
		return this.props.pricePerHour;
	}

	get createdAt() {
		return this.props.createdAt;
	}

	get updatedAt() {
		return this.props.updatedAt;
	}

	// => Setters
	set name(name: string) {
		this.props.name = name;

		this.touch();
	}

	set description(description: string | null | undefined) {
		this.props.description = description;

		this.touch();
	}

	set coverImage(coverImage: CourtImage | null) {
		this.props.coverImage = coverImage;

		this.touch();
	}

	set address(address: string) {
		this.props.address = address;

		this.touch();
	}

	set latitude(latitude: number) {
		this.props.latitude = latitude;

		this.touch();
	}

	set longitude(longitude: number) {
		this.props.longitude = longitude;

		this.touch();
	}

	set images(images: CourtImagesList) {
		this.props.images = images;

		this.touch();
	}

	set pricePerHour(pricePerHour: Cash) {
		this.props.pricePerHour = pricePerHour;

		this.touch();
	}

	putOnline() {
		this.props.status = 'ONLINE';
		this.touch();
	}

	pause() {
		this.props.status = 'PAUSED';
		this.touch();
	}

	markAsPending() {
		this.props.status = 'PENDING';
		this.touch();
	}

	markAsInMaintenance() {
		this.props.status = 'IN_MAINTENANCE';
		this.touch();
	}

	// => Methods
	private touch() {
		this.props.updatedAt = new Date();
	}
}
