/**
 * Country name and flag emoji mappings
 * Used for leaderboard display and regional pool stats
 */

export const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States',
  GB: 'United Kingdom',
  CA: 'Canada',
  AU: 'Australia',
  ZA: 'South Africa',
  NG: 'Nigeria',
  KE: 'Kenya',
  GH: 'Ghana',
  DE: 'Germany',
  FR: 'France',
  NL: 'Netherlands',
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  FI: 'Finland',
  CH: 'Switzerland',
  AT: 'Austria',
  BE: 'Belgium',
  ES: 'Spain',
  IT: 'Italy',
  PT: 'Portugal',
  IE: 'Ireland',
  PL: 'Poland',
  CZ: 'Czech Republic',
  HU: 'Hungary',
  RO: 'Romania',
  BR: 'Brazil',
  MX: 'Mexico',
  AR: 'Argentina',
  CL: 'Chile',
  CO: 'Colombia',
  IN: 'India',
  PK: 'Pakistan',
  BD: 'Bangladesh',
  PH: 'Philippines',
  ID: 'Indonesia',
  MY: 'Malaysia',
  SG: 'Singapore',
  TH: 'Thailand',
  VN: 'Vietnam',
  NZ: 'New Zealand',
  JP: 'Japan',
  KR: 'South Korea',
  TW: 'Taiwan',
  HK: 'Hong Kong',
  IL: 'Israel',
  AE: 'United Arab Emirates',
  SA: 'Saudi Arabia',
  EG: 'Egypt',
  MA: 'Morocco',
  TZ: 'Tanzania',
  UG: 'Uganda',
  ZM: 'Zambia',
  ZW: 'Zimbabwe',
}

export const COUNTRY_FLAGS: Record<string, string> = {
  US: '🇺🇸',
  GB: '🇬🇧',
  CA: '🇨🇦',
  AU: '🇦🇺',
  ZA: '🇿🇦',
  NG: '🇳🇬',
  KE: '🇰🇪',
  GH: '🇬🇭',
  DE: '🇩🇪',
  FR: '🇫🇷',
  NL: '🇳🇱',
  SE: '🇸🇪',
  NO: '🇳🇴',
  DK: '🇩🇰',
  FI: '🇫🇮',
  CH: '🇨🇭',
  AT: '🇦🇹',
  BE: '🇧🇪',
  ES: '🇪🇸',
  IT: '🇮🇹',
  PT: '🇵🇹',
  IE: '🇮🇪',
  PL: '🇵🇱',
  CZ: '🇨🇿',
  HU: '🇭🇺',
  RO: '🇷🇴',
  BR: '🇧🇷',
  MX: '🇲🇽',
  AR: '🇦🇷',
  CL: '🇨🇱',
  CO: '🇨🇴',
  IN: '🇮🇳',
  PK: '🇵🇰',
  BD: '🇧🇩',
  PH: '🇵🇭',
  ID: '🇮🇩',
  MY: '🇲🇾',
  SG: '🇸🇬',
  TH: '🇹🇭',
  VN: '🇻🇳',
  NZ: '🇳🇿',
  JP: '🇯🇵',
  KR: '🇰🇷',
  TW: '🇹🇼',
  HK: '🇭🇰',
  IL: '🇮🇱',
  AE: '🇦🇪',
  SA: '🇸🇦',
  EG: '🇪🇬',
  MA: '🇲🇦',
  TZ: '🇹🇿',
  UG: '🇺🇬',
  ZM: '🇿🇲',
  ZW: '🇿🇼',
}

/**
 * Get country name from ISO code
 */
export function getCountryName(code: string): string {
  return COUNTRY_NAMES[code.toUpperCase()] || code
}

/**
 * Get country flag emoji from ISO code
 */
export function getCountryFlag(code: string): string {
  return COUNTRY_FLAGS[code.toUpperCase()] || '🌍'
}

/**
 * Get country display string (flag + name)
 */
export function getCountryDisplay(code: string): string {
  const flag = getCountryFlag(code)
  const name = getCountryName(code)
  return `${flag} ${name}`
}
