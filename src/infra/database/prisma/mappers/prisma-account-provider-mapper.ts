import { AccountProvider } from "generated/prisma/enums"

export class PrismaAccountProviderMapper {
  static toPrisma(provider: string): AccountProvider {
    const map: Record<string, AccountProvider> = {
      github: AccountProvider.GITHUB,
      google: AccountProvider.GOOGLE
    }

    const prismaProvider = map[provider.toLowerCase()]

    if (!prismaProvider) {
      throw new Error(`Invalid  account provider: ${provider}`)
    }

    return prismaProvider
  }

  static toDomain(provider: AccountProvider): string {
    const map: Record<AccountProvider, string> = {
      [AccountProvider.GITHUB]: 'github',
      [AccountProvider.GOOGLE]: 'google'
    }

    const domainProvider = map[provider]

    if (!domainProvider) {
      throw new Error(`Unknown Prisma provider: ${provider}`)
    }

    return domainProvider
  }
}