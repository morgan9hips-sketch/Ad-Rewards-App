import { useState, useEffect } from 'react'

interface BankField {
  name: string
  label: string
  placeholder: string
  type: string
  pattern?: string
  maxLength?: number
  required: boolean
}

interface CountryBankFieldsProps {
  currency: string
  country: string
  values: Record<string, string>
  onChange: (field: string, value: string) => void
  errors?: Record<string, string>
}

const BANK_FIELD_CONFIGS: Record<string, BankField[]> = {
  US: [
    {
      name: 'accountNumber',
      label: 'Account Number',
      placeholder: '000123456789',
      type: 'text',
      required: true
    },
    {
      name: 'routingNumber',
      label: 'Routing Number (ABA)',
      placeholder: '123456789',
      type: 'text',
      pattern: '[0-9]{9}',
      maxLength: 9,
      required: true
    },
    {
      name: 'accountType',
      label: 'Account Type',
      placeholder: 'checking',
      type: 'select',
      required: true
    }
  ],
  GB: [
    {
      name: 'accountNumber',
      label: 'Account Number',
      placeholder: '12345678',
      type: 'text',
      maxLength: 8,
      required: true
    },
    {
      name: 'sortCode',
      label: 'Sort Code',
      placeholder: '12-34-56',
      type: 'text',
      pattern: '[0-9]{2}-[0-9]{2}-[0-9]{2}',
      maxLength: 8,
      required: true
    }
  ],
  ZA: [
    {
      name: 'iban',
      label: 'IBAN',
      placeholder: 'ZA00123456789012345678901',
      type: 'text',
      maxLength: 34,
      required: true
    }
  ],
  EU: [
    {
      name: 'iban',
      label: 'IBAN',
      placeholder: 'DE89370400440532013000',
      type: 'text',
      maxLength: 34,
      required: true
    }
  ]
}

export default function CountryBankFields({
  currency,
  country,
  values,
  onChange,
  errors = {}
}: CountryBankFieldsProps) {
  const [fieldConfig, setFieldConfig] = useState<BankField[]>([])

  useEffect(() => {
    // Determine which fields to show based on country
    let config: BankField[] = []
    
    if (country === 'US') {
      config = BANK_FIELD_CONFIGS.US
    } else if (country === 'GB') {
      config = BANK_FIELD_CONFIGS.GB
    } else if (country === 'ZA' || currency === 'ZAR') {
      config = BANK_FIELD_CONFIGS.ZA
    } else if (['DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'PT', 'AT'].includes(country) || currency === 'EUR') {
      config = BANK_FIELD_CONFIGS.EU
    } else {
      // Default to account number only
      config = [
        {
          name: 'accountNumber',
          label: 'Bank Account Number',
          placeholder: 'Your account number',
          type: 'text',
          required: true
        }
      ]
    }
    
    setFieldConfig(config)
  }, [currency, country])

  const renderField = (field: BankField) => {
    if (field.type === 'select' && field.name === 'accountType') {
      return (
        <select
          value={values[field.name] || ''}
          onChange={(e) => onChange(field.name, e.target.value)}
          className={`w-full bg-gray-800 border ${
            errors[field.name] ? 'border-red-500' : 'border-gray-700'
          } rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500`}
          required={field.required}
        >
          <option value="">Select account type</option>
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
        </select>
      )
    }

    return (
      <input
        type={field.type}
        value={values[field.name] || ''}
        onChange={(e) => onChange(field.name, e.target.value)}
        placeholder={field.placeholder}
        pattern={field.pattern}
        maxLength={field.maxLength}
        required={field.required}
        className={`w-full bg-gray-800 border ${
          errors[field.name] ? 'border-red-500' : 'border-gray-700'
        } rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500`}
      />
    )
  }

  return (
    <div className="space-y-4">
      {fieldConfig.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {field.label}
            {field.required && <span className="text-red-400 ml-1">*</span>}
          </label>
          {renderField(field)}
          {errors[field.name] && (
            <p className="text-red-400 text-sm mt-1">{errors[field.name]}</p>
          )}
          {field.name === 'iban' && (
            <p className="text-gray-500 text-xs mt-1">
              International Bank Account Number (IBAN) format
            </p>
          )}
          {field.name === 'routingNumber' && (
            <p className="text-gray-500 text-xs mt-1">
              9-digit ABA routing number from your check
            </p>
          )}
          {field.name === 'sortCode' && (
            <p className="text-gray-500 text-xs mt-1">
              6-digit code in format XX-XX-XX
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
