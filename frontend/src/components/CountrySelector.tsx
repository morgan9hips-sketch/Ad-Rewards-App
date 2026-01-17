interface Country {
  code: string
  name: string
  flag: string
}

const countries: Country[] = [
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
]

interface CountrySelectorProps {
  selected: string | null
  onSelect: (countryCode: string) => void
  autoDetected?: string | null
}

export default function CountrySelector({ selected, onSelect, autoDetected }: CountrySelectorProps) {
  const selectedCountry = countries.find((c) => c.code === selected)

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Country Badge
      </label>
      {autoDetected && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mb-3">
          <p className="text-sm text-blue-300">
            🌍 Auto-detected: {countries.find((c) => c.code === autoDetected)?.flag}{' '}
            {countries.find((c) => c.code === autoDetected)?.name}
          </p>
        </div>
      )}
      <select
        value={selected || ''}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
      >
        <option value="">Select a country</option>
        {countries.map((country) => (
          <option key={country.code} value={country.code}>
            {country.flag} {country.name}
          </option>
        ))}
      </select>
      {selectedCountry && (
        <div className="mt-3 text-center">
          <p className="text-gray-400 text-sm mb-1">Preview:</p>
          <span className="text-4xl">{selectedCountry.flag}</span>
        </div>
      )}
    </div>
  )
}

export { countries }
export type { Country }
