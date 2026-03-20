import { PrismaClient } from '@prisma/client'
import { getCurrencyForCountry } from './currencyService.js'

const prisma = new PrismaClient()

export interface CanonicalUserContext {
  countryCode: string
  preferredCurrency: string
}

function normalizeCountryCode(countryCode: string | null | undefined): string {
  if (!countryCode || typeof countryCode !== 'string') {
    return ''
  }

  return countryCode.trim().toUpperCase()
}

export async function getCanonicalUserContext(
  userId: string,
): Promise<CanonicalUserContext> {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: {
      revenueCountry: true,
      countryCode: true,
      displayCountry: true,
      lastDetectedCountry: true,
      preferredCurrency: true,
    },
  })

  const countryCode =
    normalizeCountryCode(profile?.revenueCountry) ||
    normalizeCountryCode(profile?.countryCode) ||
    normalizeCountryCode(profile?.displayCountry) ||
    normalizeCountryCode(profile?.lastDetectedCountry) ||
    'US'

  const preferredCurrency =
    profile?.preferredCurrency || getCurrencyForCountry(countryCode)

  return {
    countryCode,
    preferredCurrency,
  }
}
