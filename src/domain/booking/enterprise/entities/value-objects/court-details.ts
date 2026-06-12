import { ValueObject } from '@/core/entities/value-object'
import type { Image } from '../image'

interface CourtDetailsProps {
  courtId: string
  name: string
  description: string | null
  address: string
  latitude: number
  longitude: number
  images: Image[]
  pricePerHour: number
  rating: number
  reviewsCount: number
}

export class CourtDetails extends ValueObject<CourtDetailsProps> {
  get courtId() {
    return this.props.courtId
  }

  get name() {
    return this.props.name
  }

  get description() {
    return this.props.description
  }

  get address() {
    return this.props.address
  }

  get latitude() {
    return this.props.latitude
  }

  get longitude() {
    return this.props.longitude
  }

  get images() {
    return this.props.images
  }

  get pricePerHour() {
    return this.props.pricePerHour
  }

  get rating() {
    return this.props.rating
  }

  get reviewsCount() {
    return this.props.reviewsCount
  }

  static create(props: CourtDetailsProps) {
    return new CourtDetails(props)
  }
}