import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.js'
import {
  createSubscription,
  getSubscriptionDetails,
  cancelSubscription,
  verifyWebhookSignature,
} from '../services/paypalService.js'

const router = Router()
const prisma = new PrismaClient()

/**
 * POST /api/subscriptions/create
 * Create a new subscription (Elite tier only)
 */
router.post('/create', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { tier } = req.body // 'Elite'

    if (tier !== 'Elite') {
      return res.status(400).json({
        success: false,
        error: 'Invalid tier. Only Elite subscription is available.',
      })
    }

    // Get the Elite plan ID from environment
    const planId = process.env.PAYPAL_ELITE_PLAN_ID

    if (!planId) {
      return res.status(500).json({
        success: false,
        error: 'Elite plan not configured. Please contact support.',
      })
    }

    // Create subscription with PayPal
    const { subscriptionId, approvalUrl } = await createSubscription(planId)

    // Store pending subscription in database
    await prisma.userProfile.update({
      where: { userId: userId },
      data: {
        subscriptionId,
        subscriptionStatus: 'PENDING',
        subscriptionPlanId: planId,
      },
    })

    res.json({
      success: true,
      subscriptionId,
      approvalUrl,
      message: 'Elite subscription created. Please complete payment.',
    })
  } catch (error: any) {
    console.error('Error creating subscription:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create subscription',
    })
  }
})

/**
 * GET /api/subscriptions/status
 * Get current subscription status
 */
router.get('/status', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: {
        tier: true,
        subscriptionId: true,
        subscriptionStatus: true,
        subscriptionPlanId: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
      },
    })

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found',
      })
    }

    // If user has a subscription, get latest details from PayPal
    let paypalDetails = null
    if (profile.subscriptionId) {
      try {
        paypalDetails = await getSubscriptionDetails(profile.subscriptionId)
      } catch (error) {
        console.error('Error fetching PayPal subscription details:', error)
      }
    }

    res.json({
      success: true,
      tier: profile.tier,
      subscriptionId: profile.subscriptionId,
      subscriptionStatus: profile.subscriptionStatus,
      subscriptionPlanId: profile.subscriptionPlanId,
      subscriptionStartDate: profile.subscriptionStartDate,
      subscriptionEndDate: profile.subscriptionEndDate,
      paypalDetails,
    })
  } catch (error) {
    console.error('Error fetching subscription status:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription status',
    })
  }
})

/**
 * POST /api/subscriptions/cancel
 * Cancel current subscription
 */
router.post('/cancel', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const { reason } = req.body

    const profile = await prisma.userProfile.findUnique({
      where: { userId: userId },
      select: { subscriptionId: true },
    })

    if (!profile?.subscriptionId) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found',
      })
    }

    // Cancel subscription with PayPal
    await cancelSubscription(profile.subscriptionId, reason || 'User requested cancellation')

    // Update database
    await prisma.userProfile.update({
      where: { userId: userId },
      data: {
        subscriptionStatus: 'CANCELLED',
        tier: 'Free',
      },
    })

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
    })
  } catch (error: any) {
    console.error('Error cancelling subscription:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to cancel subscription',
    })
  }
})

/**
 * POST /api/subscriptions/webhook
 * Handle PayPal webhook events
 */
router.post('/webhook', async (req, res) => {
  try {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID || ''
    
    // Verify webhook signature
    const isValid = await verifyWebhookSignature(webhookId, req.headers, req.body)
    
    if (!isValid) {
      console.error('Invalid webhook signature')
      return res.status(401).json({ error: 'Invalid signature' })
    }

    const event = req.body
    const eventType = event.event_type
    const resource = event.resource

    console.log(`📥 PayPal webhook received: ${eventType}`)

    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.CREATED':
        // Subscription created but not yet activated
        await handleSubscriptionCreated(resource)
        break

      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        // Subscription activated - user completed payment
        await handleSubscriptionActivated(resource)
        break

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        // User or admin cancelled subscription
        await handleSubscriptionCancelled(resource)
        break

      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        // Subscription suspended (payment failed)
        await handleSubscriptionSuspended(resource)
        break

      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
        // Payment failed
        await handlePaymentFailed(resource)
        break

      default:
        console.log(`Unhandled webhook event: ${eventType}`)
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

/**
 * Webhook handlers
 */

async function handleSubscriptionCreated(resource: any) {
  const subscriptionId = resource.id
  console.log(`Subscription created: ${subscriptionId}`)
  // Subscription is already in database from /create endpoint
}

async function handleSubscriptionActivated(resource: any) {
  const subscriptionId = resource.id
  const planId = resource.plan_id
  
  // Determine tier from plan ID - map to new UserTier enum
  // Any paid subscription plan gets Elite tier
  const elitePlanIds = [
    process.env.PAYPAL_ELITE_PLAN_ID,
    process.env.PAYPAL_SILVER_PLAN_ID,
    process.env.PAYPAL_GOLD_PLAN_ID,
  ].filter(Boolean) // Remove undefined values
  
  const tier: 'Free' | 'Elite' = elitePlanIds.includes(planId) ? 'Elite' : 'Free'

  // Update user profile
  await prisma.userProfile.updateMany({
    where: { subscriptionId: subscriptionId },
    data: {
      tier,
      subscriptionStatus: 'ACTIVE',
      subscriptionStartDate: new Date(),
    },
  })

  console.log(`✅ Subscription activated: ${subscriptionId} -> ${tier} tier`)
}

async function handleSubscriptionCancelled(resource: any) {
  const subscriptionId = resource.id

  await prisma.userProfile.updateMany({
    where: { subscriptionId: subscriptionId },
    data: {
      tier: 'Free',
      subscriptionStatus: 'CANCELLED',
      subscriptionEndDate: new Date(),
    },
  })

  console.log(`❌ Subscription cancelled: ${subscriptionId}`)
}

async function handleSubscriptionSuspended(resource: any) {
  const subscriptionId = resource.id

  await prisma.userProfile.updateMany({
    where: { subscriptionId },
    data: {
      subscriptionStatus: 'SUSPENDED',
    },
  })

  console.log(`⚠️ Subscription suspended: ${subscriptionId}`)
}

async function handlePaymentFailed(resource: any) {
  const subscriptionId = resource.id

  // Mark subscription as suspended with grace period
  await prisma.userProfile.updateMany({
    where: { subscriptionId: subscriptionId },
    data: {
      subscriptionStatus: 'SUSPENDED',
    },
  })

  // TODO: Implement user notification system
  // - Send email notification about payment failure
  // - Provide link to update payment method
  // - Inform about 3-day grace period before downgrade
  
  // TODO: Implement grace period logic
  // - Set grace period end date (3 days from now)
  // - Create scheduled job to check grace period expiration
  // - Downgrade to Bronze tier if payment not resolved within grace period

  console.log(`💳 Payment failed for subscription: ${subscriptionId}`)
  console.warn('⚠️ Grace period and notification system not yet implemented')
}

export default router
