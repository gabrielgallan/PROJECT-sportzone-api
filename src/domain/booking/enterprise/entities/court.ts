import { AggregatedRoot } from '@/core/entities/aggregate-root';
import type { UniqueEntityID } from '@/core/entities/unique-entity-id';
import type { Optional } from '@/core/types/optional';
import type { Cash } from '../../../../core/shared/value-objects/cash';
import type { CourtImagesList } from './court-images-list';

type CourtStatus = 'IN_MAINTENENCE' | 'PAUSED' | 'PENDIND' | 'ONLINE';

export interface CourtProps {
	organizationId: UniqueEntityID;
	name: string;
	description?: string | null;
	coverImageUrl: string;

	phone?: string | null;
	address: string;
	latitude: number;
	longitude: number;

	images: CourtImagesList;

	rate: number;
	status: CourtStatus;
	pricePerHour: Cash;
	createdAt: Date;
	updatedAt?: Date | null;
}

export class Court extends AggregatedRoot<CourtProps> {
	static create(props: Optional<CourtProps, 'createdAt' | 'status' | 'rate'>, id?: UniqueEntityID) {
		const court = new Court(
			{
				...props,
				description: props.description ?? null,
				phone: props.phone ?? null,
				status: props.status ?? 'PENDIND',
				rate: props.rate ?? 0,
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

	get coverImageUrl() {
		return this.props.coverImageUrl;
	}

	get phone() {
		return this.props.phone;
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

	get rate() {
		return this.props.rate;
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

	set coverImageUrl(coverImageUrl: string) {
		this.props.coverImageUrl = coverImageUrl;

		this.touch();
	}

	set status(status: CourtStatus) {
		this.props.status = status;

		this.touch();
	}

	set phone(phone: string | null | undefined) {
		this.props.phone = phone;

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

	// => Methods
	private touch() {
		this.props.updatedAt = new Date();
	}
}
