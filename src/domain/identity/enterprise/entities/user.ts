import { Entity } from "@/core/entities/entity";
import type { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { Optional } from "@/core/types/optional";

enum UserRole {
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN'
}

export interface UserProps {
  name?: string | null
  email: string
  role: UserRole 
  passwordHash?: string | null
  avatarUrl?: string | null
  createdAt: Date
  updatedAt?: Date | null
}

export class User extends Entity<UserProps> {
  static create(
    props: Optional<UserProps, 'createdAt' | 'role'>,
    id?: UniqueEntityID,
  ) {
    const user = new User(
      {
        ...props,
        name: props.name ?? null,
        role: props.role ?? UserRole.MEMBER,
        passwordHash: props.passwordHash ?? null,
        avatarUrl: props.avatarUrl ?? null,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
      },
      id,
    )

    return user
  }

  // Getters
  get name() {
    return this.props.name
  }

  get email() {
    return this.props.email
  }

  get role() {
    return this.props.role
  }

  get passwordHash() {
    return this.props.passwordHash
  }

  get avatarUrl() {
    return this.props.avatarUrl
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  // Setters
  set avatarUrl(url: string | null | undefined) {
    this.props.avatarUrl = url
  }

  set passwordHash(passwordHash: string | null | undefined) {
    this.props.passwordHash = passwordHash

    this.touch()
  }

  // Methods
  touch() {
    this.props.updatedAt = new Date()
  }
}