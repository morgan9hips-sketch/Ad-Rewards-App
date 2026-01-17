// Country code to flag emoji mapping
export const countryFlags: Record<string, string> = {
  ZA: '🇿🇦', // South Africa
  US: '🇺🇸', // United States
  GB: '🇬🇧', // United Kingdom
  NG: '🇳🇬', // Nigeria
  CA: '🇨🇦', // Canada
  AU: '🇦🇺', // Australia
  IN: '🇮🇳', // India
  BR: '🇧🇷', // Brazil
  MX: '🇲🇽', // Mexico
  DE: '🇩🇪', // Germany
  FR: '🇫🇷', // France
  ES: '🇪🇸', // Spain
  IT: '🇮🇹', // Italy
  JP: '🇯🇵', // Japan
  KR: '🇰🇷', // South Korea
  CN: '🇨🇳', // China
  NL: '🇳🇱', // Netherlands
  SE: '🇸🇪', // Sweden
  NO: '🇳🇴', // Norway
  DK: '🇩🇰', // Denmark
  FI: '🇫🇮', // Finland
  PL: '🇵🇱', // Poland
  PT: '🇵🇹', // Portugal
  GR: '🇬🇷', // Greece
  TR: '🇹🇷', // Turkey
  RU: '🇷🇺', // Russia
  AE: '🇦🇪', // United Arab Emirates
  SA: '🇸🇦', // Saudi Arabia
  EG: '🇪🇬', // Egypt
  KE: '🇰🇪', // Kenya
  GH: '🇬🇭', // Ghana
  TZ: '🇹🇿', // Tanzania
  UG: '🇺🇬', // Uganda
  ZW: '🇿🇼', // Zimbabwe
  PH: '🇵🇭', // Philippines
  ID: '🇮🇩', // Indonesia
  MY: '🇲🇾', // Malaysia
  SG: '🇸🇬', // Singapore
  TH: '🇹🇭', // Thailand
  VN: '🇻🇳', // Vietnam
  AR: '🇦🇷', // Argentina
  CL: '🇨🇱', // Chile
  CO: '🇨🇴', // Colombia
  PE: '🇵🇪', // Peru
  VE: '🇻🇪', // Venezuela
}

/**
 * Get flag emoji for a country code
 * @param countryCode ISO 2-letter country code
 * @param hideCountry Whether to hide the country (show globe instead)
 * @returns Flag emoji or globe emoji
 */
export function getCountryFlag(countryCode: string | null, hideCountry: boolean = false): string {
  if (hideCountry || !countryCode) {
    return '🌍' // Globe for hidden or unknown countries
  }
  return countryFlags[countryCode.toUpperCase()] || '🌍'
}

/**
 * Get country name from code (basic implementation)
 * @param countryCode ISO 2-letter country code
 * @returns Country name or code if not found
 */
export function getCountryName(countryCode: string): string {
  const countryNames: Record<string, string> = {
    ZA: 'South Africa',
    US: 'United States',
    GB: 'United Kingdom',
    NG: 'Nigeria',
    CA: 'Canada',
    AU: 'Australia',
    IN: 'India',
    BR: 'Brazil',
    MX: 'Mexico',
    DE: 'Germany',
    FR: 'France',
    ES: 'Spain',
    IT: 'Italy',
    JP: 'Japan',
    KR: 'South Korea',
    CN: 'China',
  }
  return countryNames[countryCode.toUpperCase()] || countryCode
}
