import axios from 'axios'

const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'sandbox' 
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com'

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || ''
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || ''

/**
 * Get PayPal access token
 */
async function getAccessToken(): Promise<string> {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64')
    
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    return response.data.access_token
  } catch (error: any) {
    console.error('Error getting PayPal access token:', error.response?.data || error.message)
    throw new Error('Failed to authenticate with PayPal')
  }
}

/**
 * Create a subscription plan
 */
export async function createSubscriptionPlan(
  name: string,
  description: string,
  price: string,
  currency: string
): Promise<string> {
  try {
    const accessToken = await getAccessToken()

    const planData = {
      product_id: process.env.PAYPAL_PRODUCT_ID || 'PROD-ADIFY-001', // Create product first in PayPal dashboard
      name,
      description,
      billing_cycles: [
        {
          frequency: {
            interval_unit: 'MONTH',
            interval_count: 1,
          },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0, // Infinite
          pricing_scheme: {
            fixed_price: {
              value: price,
              currency_code: currency,
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3,
      },
    }

    const response = await axios.post(
      `${PAYPAL_API_BASE}/v1/billing/plans`,
      planData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data.id
  } catch (error: any) {
    console.error('Error creating subscription plan:', error.response?.data || error.message)
    throw new Error('Failed to create subscription plan')
  }
}

/**
 * Create a subscription
 */
export async function createSubscription(planId: string): Promise<{
  subscriptionId: string
  approvalUrl: string
}> {
  try {
    const accessToken = await getAccessToken()

    const subscriptionData = {
      plan_id: planId,
      application_context: {
        brand_name: 'Adify',
        locale: 'en-US',
        user_action: 'SUBSCRIBE_NOW',
        payment_method: {
          payer_selected: 'PAYPAL',
          payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
        },
        return_url: `${process.env.FRONTEND_URL}/subscription/success`,
        cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
      },
    }

    const response = await axios.post(
      `${PAYPAL_API_BASE}/v1/billing/subscriptions`,
      subscriptionData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const approvalUrl = response.data.links.find((link: any) => link.rel === 'approve')?.href || ''

    return {
      subscriptionId: response.data.id,
      approvalUrl,
    }
  } catch (error: any) {
    console.error('Error creating subscription:', error.response?.data || error.message)
    throw new Error('Failed to create subscription')
  }
}

/**
 * Get subscription details
 */
export async function getSubscriptionDetails(subscriptionId: string): Promise<any> {
  try {
    const accessToken = await getAccessToken()

    const response = await axios.get(
      `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    return response.data
  } catch (error: any) {
    console.error('Error getting subscription details:', error.response?.data || error.message)
    throw new Error('Failed to get subscription details')
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string, reason: string): Promise<void> {
  try {
    const accessToken = await getAccessToken()

    await axios.post(
      `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}/cancel`,
      { reason },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error: any) {
    console.error('Error canceling subscription:', error.response?.data || error.message)
    throw new Error('Failed to cancel subscription')
  }
}

/**
 * Create a payout
 */
export async function createPayout(
  recipientEmail: string,
  amount: string,
  currency: string,
  note: string
): Promise<{
  batchId: string
  status: string
}> {
  try {
    const accessToken = await getAccessToken()

    const payoutData = {
      sender_batch_header: {
        sender_batch_id: `batch_${Date.now()}`,
        email_subject: 'You have a payout from Adify!',
        email_message: 'You have received a payout from Adify. Thanks for using our service!',
      },
      items: [
        {
          recipient_type: 'EMAIL',
          amount: {
            value: amount,
            currency: currency,
          },
          note: note,
          sender_item_id: `item_${Date.now()}`,
          receiver: recipientEmail,
        },
      ],
    }

    const response = await axios.post(
      `${PAYPAL_API_BASE}/v1/payments/payouts`,
      payoutData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return {
      batchId: response.data.batch_header.payout_batch_id,
      status: response.data.batch_header.batch_status,
    }
  } catch (error: any) {
    console.error('Error creating payout:', error.response?.data || error.message)
    throw new Error('Failed to create payout')
  }
}

/**
 * Get payout status
 */
export async function getPayoutStatus(batchId: string): Promise<any> {
  try {
    const accessToken = await getAccessToken()

    const response = await axios.get(
      `${PAYPAL_API_BASE}/v1/payments/payouts/${batchId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    return response.data
  } catch (error: any) {
    console.error('Error getting payout status:', error.response?.data || error.message)
    throw new Error('Failed to get payout status')
  }
}

/**
 * Verify webhook signature
 */
export async function verifyWebhookSignature(
  webhookId: string,
  headers: any,
  body: any
): Promise<boolean> {
  try {
    const accessToken = await getAccessToken()

    const verificationData = {
      transmission_id: headers['paypal-transmission-id'],
      transmission_time: headers['paypal-transmission-time'],
      cert_url: headers['paypal-cert-url'],
      auth_algo: headers['paypal-auth-algo'],
      transmission_sig: headers['paypal-transmission-sig'],
      webhook_id: webhookId,
      webhook_event: body,
    }

    const response = await axios.post(
      `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
      verificationData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data.verification_status === 'SUCCESS'
  } catch (error: any) {
    console.error('Error verifying webhook signature:', error.response?.data || error.message)
    return false
  }
}
