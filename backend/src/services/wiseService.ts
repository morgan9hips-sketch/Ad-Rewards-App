import axios from 'axios'

const WISE_API_BASE = process.env.WISE_MODE === 'sandbox' 
  ? 'https://api.sandbox.transferwise.tech'
  : 'https://api.wise.com'

const WISE_API_TOKEN = process.env.WISE_API_TOKEN || ''
const WISE_PROFILE_ID = process.env.WISE_PROFILE_ID || ''

interface WiseRecipient {
  id: number
  accountHolderName: string
  currency: string
  country: string
  type: string
  details: Record<string, any>
}

interface WiseQuote {
  id: string
  sourceCurrency: string
  targetCurrency: string
  sourceAmount: number
  targetAmount: number
  rate: number
  fee: number
}

interface WiseTransfer {
  id: number
  user: number
  targetAccount: number
  quoteUuid: string
  status: string
  reference: string
}

/**
 * Get Wise API headers
 */
function getHeaders(): Record<string, string> {
  return {
    'Authorization': `Bearer ${WISE_API_TOKEN}`,
    'Content-Type': 'application/json',
  }
}

/**
 * Create a recipient account in Wise
 * @param accountHolderName Full name of the account holder
 * @param currency Target currency (USD, GBP, EUR, ZAR, etc.)
 * @param country Country code (US, GB, ZA, etc.)
 * @param bankDetails Bank account details specific to country
 * @returns Wise recipient ID
 */
export async function createWiseRecipient(
  accountHolderName: string,
  currency: string,
  country: string,
  bankDetails: Record<string, any>
): Promise<WiseRecipient> {
  try {
    // Determine account type based on country/currency
    let type = 'bank_account'
    if (currency === 'EUR' || currency === 'ZAR') {
      type = 'iban'
    }

    const recipientData = {
      currency,
      type,
      profile: WISE_PROFILE_ID,
      accountHolderName,
      ownedByCustomer: false,
      details: {
        ...bankDetails,
        address: {
          country,
          firstLine: bankDetails.address || '',
          postCode: bankDetails.postCode || '',
          city: bankDetails.city || '',
        },
      },
    }

    const response = await axios.post(
      `${WISE_API_BASE}/v1/accounts`,
      recipientData,
      { headers: getHeaders() }
    )

    return response.data
  } catch (error: any) {
    console.error('Error creating Wise recipient:', error.response?.data || error.message)
    throw new Error(`Failed to create Wise recipient: ${error.response?.data?.errors?.[0]?.message || error.message}`)
  }
}

/**
 * Create a quote for a transfer
 * @param sourceCurrency Source currency (usually USD)
 * @param targetCurrency Target currency for the recipient
 * @param sourceAmount Amount in source currency
 * @returns Quote ID and details
 */
export async function createWiseQuote(
  sourceCurrency: string,
  targetCurrency: string,
  sourceAmount: number
): Promise<WiseQuote> {
  try {
    const quoteData = {
      sourceCurrency,
      targetCurrency,
      sourceAmount,
      profile: WISE_PROFILE_ID,
    }

    const response = await axios.post(
      `${WISE_API_BASE}/v3/profiles/${WISE_PROFILE_ID}/quotes`,
      quoteData,
      { headers: getHeaders() }
    )

    return response.data
  } catch (error: any) {
    console.error('Error creating Wise quote:', error.response?.data || error.message)
    throw new Error(`Failed to create Wise quote: ${error.response?.data?.errors?.[0]?.message || error.message}`)
  }
}

/**
 * Create a transfer (payout) in Wise
 * @param recipientId Wise recipient account ID
 * @param quoteId Quote ID from createWiseQuote
 * @param reference Payment reference/description
 * @returns Transfer ID
 */
export async function createWisePayout(
  recipientId: number,
  quoteId: string,
  reference: string
): Promise<WiseTransfer> {
  try {
    const transferData = {
      targetAccount: recipientId,
      quoteUuid: quoteId,
      customerTransactionId: reference,
      details: {
        reference,
        transferPurpose: 'verification.transfers.purpose.pay.bills',
        sourceOfFunds: 'verification.source.of.funds.other',
      },
    }

    const response = await axios.post(
      `${WISE_API_BASE}/v1/transfers`,
      transferData,
      { headers: getHeaders() }
    )

    return response.data
  } catch (error: any) {
    console.error('Error creating Wise transfer:', error.response?.data || error.message)
    throw new Error(`Failed to create Wise transfer: ${error.response?.data?.errors?.[0]?.message || error.message}`)
  }
}

/**
 * Fund a transfer to execute the payout
 * @param transferId Transfer ID from createWisePayout
 * @returns Transfer status
 */
export async function fundWiseTransfer(transferId: number): Promise<any> {
  try {
    const response = await axios.post(
      `${WISE_API_BASE}/v3/profiles/${WISE_PROFILE_ID}/transfers/${transferId}/payments`,
      { type: 'BALANCE' },
      { headers: getHeaders() }
    )

    return response.data
  } catch (error: any) {
    console.error('Error funding Wise transfer:', error.response?.data || error.message)
    throw new Error(`Failed to fund Wise transfer: ${error.response?.data?.errors?.[0]?.message || error.message}`)
  }
}

/**
 * Get the status of a transfer
 * @param transferId Transfer ID
 * @returns Transfer status details
 */
export async function getWiseTransferStatus(transferId: number): Promise<any> {
  try {
    const response = await axios.get(
      `${WISE_API_BASE}/v1/transfers/${transferId}`,
      { headers: getHeaders() }
    )

    return response.data
  } catch (error: any) {
    console.error('Error getting Wise transfer status:', error.response?.data || error.message)
    throw new Error(`Failed to get Wise transfer status: ${error.response?.data?.errors?.[0]?.message || error.message}`)
  }
}

/**
 * Get required fields for a specific currency/country combination
 * This is useful for frontend to know what fields to show
 */
export async function getRequiredFields(
  sourceCurrency: string,
  targetCurrency: string,
  sourceAmount: number
): Promise<any> {
  try {
    const response = await axios.get(
      `${WISE_API_BASE}/v1/quotes`,
      {
        params: {
          sourceCurrency,
          targetCurrency,
          sourceAmount,
          profile: WISE_PROFILE_ID,
        },
        headers: getHeaders(),
      }
    )

    return response.data
  } catch (error: any) {
    console.error('Error getting required fields:', error.response?.data || error.message)
    throw new Error(`Failed to get required fields: ${error.response?.data?.errors?.[0]?.message || error.message}`)
  }
}

/**
 * Validate bank details for a specific currency
 * @param currency Target currency
 * @param bankDetails Bank account details to validate
 * @returns Validation result
 */
export function validateBankDetails(
  currency: string,
  country: string,
  bankDetails: Record<string, any>
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Country-specific validation
  switch (country.toUpperCase()) {
    case 'US':
      if (!bankDetails.accountNumber) errors.push('Account number is required')
      if (!bankDetails.routingNumber) errors.push('Routing number is required')
      if (!bankDetails.accountType) errors.push('Account type is required')
      if (bankDetails.routingNumber && !/^\d{9}$/.test(bankDetails.routingNumber)) {
        errors.push('Routing number must be 9 digits')
      }
      break

    case 'GB':
      if (!bankDetails.accountNumber) errors.push('Account number is required')
      if (!bankDetails.sortCode) errors.push('Sort code is required')
      if (bankDetails.sortCode && !/^\d{6}$/.test(bankDetails.sortCode.replace(/-/g, ''))) {
        errors.push('Sort code must be 6 digits')
      }
      break

    case 'ZA':
    case 'DE':
    case 'FR':
    case 'ES':
    case 'IT':
    case 'NL':
      if (!bankDetails.iban) errors.push('IBAN is required')
      if (bankDetails.iban && !/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(bankDetails.iban)) {
        errors.push('Invalid IBAN format')
      }
      break

    default:
      // Generic validation for other countries
      if (!bankDetails.accountNumber && !bankDetails.iban) {
        errors.push('Account number or IBAN is required')
      }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
