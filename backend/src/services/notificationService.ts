import { PrismaClient, NotificationEvent } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Send a notification
 * Stores in database and can be extended to send emails/webhooks
 */
export async function sendNotification(
  event: NotificationEvent,
  data: any,
  recipients: string[]
): Promise<void> {
  try {
    // Store notification in database
    await prisma.notification.create({
      data: {
        event,
        data,
        sentTo: recipients,
        sentAt: new Date(),
      },
    })

    // Log notification
    console.log(`Notification sent: ${event}`, {
      recipients: recipients.length,
      data: JSON.stringify(data).substring(0, 100),
    })

    // TODO: Send actual emails/webhooks here
    // await sendEmail(recipients, event, data)
    // await sendWebhook(event, data)
  } catch (error) {
    console.error('Error sending notification:', error)
  }
}

/**
 * Send withdrawal requested notification
 */
export async function notifyWithdrawalRequested(
  userId: string,
  amount: number,
  currency: string
): Promise<void> {
  const data = { userId, amount, currency }
  const recipients = [process.env.ADMIN_EMAIL || 'admin@example.com']
  await sendNotification('WITHDRAWAL_REQUESTED', data, recipients)
}

/**
 * Send AdMob revenue received notification
 */
export async function notifyAdmobRevenueReceived(
  countryCode: string,
  revenueUsd: number,
  videoCount: number
): Promise<void> {
  const data = { countryCode, revenueUsd, videoCount }
  const recipients = [process.env.ADMIN_EMAIL || 'admin@example.com']
  await sendNotification('ADMOB_REVENUE_RECEIVED', data, recipients)
}

/**
 * Send user reached min threshold notification
 */
export async function notifyUserReachedMinThreshold(
  userId: string,
  email: string,
  totalValue: number
): Promise<void> {
  const data = { userId, email, totalValue }
  const recipients = [process.env.ADMIN_EMAIL || 'admin@example.com']
  await sendNotification('USER_REACHED_MIN_THRESHOLD', data, recipients)
}

/**
 * Send signup bonus triggered notification
 */
export async function notifySignupBonusTriggered(
  userId: string,
  countryCode: string,
  userNumber: number
): Promise<void> {
  const data = { userId, countryCode, userNumber }
  const recipients = [process.env.ADMIN_EMAIL || 'admin@example.com']
  await sendNotification('SIGNUP_BONUS_TRIGGERED', data, recipients)
}

/**
 * Send referral qualified notification
 */
export async function notifyReferralQualified(
  referrerId: string,
  refereeId: string,
  bonusCoins: number
): Promise<void> {
  const data = { referrerId, refereeId, bonusCoins }
  const recipients = [process.env.ADMIN_EMAIL || 'admin@example.com']
  await sendNotification('REFERRAL_QUALIFIED', data, recipients)
}

/**
 * Send coin expiry notification
 */
export async function notifyCoinExpiry(
  userId: string,
  coinsExpired: number,
  reason: string
): Promise<void> {
  const data = { userId, coinsExpired, reason }
  const recipients = [process.env.ADMIN_EMAIL || 'admin@example.com']
  await sendNotification('COIN_EXPIRY', data, recipients)
}

/**
 * Send cash expiry notification
 */
export async function notifyCashExpiry(
  userId: string,
  cashExpired: number,
  reason: string
): Promise<void> {
  const data = { userId, cashExpired, reason }
  const recipients = [process.env.ADMIN_EMAIL || 'admin@example.com']
  await sendNotification('CASH_EXPIRY', data, recipients)
}

/**
 * Send Elite subscription purchased notification
 */
export async function notifyEliteSubscriptionPurchased(
  userId: string,
  subscriptionId: string
): Promise<void> {
  const data = { userId, subscriptionId }
  const recipients = [process.env.ADMIN_EMAIL || 'admin@example.com']
  await sendNotification('ELITE_SUBSCRIPTION_PURCHASED', data, recipients)
}

/**
 * Send Elite subscription cancelled notification
 */
export async function notifyEliteSubscriptionCancelled(
  userId: string,
  subscriptionId: string
): Promise<void> {
  const data = { userId, subscriptionId }
  const recipients = [process.env.ADMIN_EMAIL || 'admin@example.com']
  await sendNotification('ELITE_SUBSCRIPTION_CANCELLED', data, recipients)
}

/**
 * Get recent notifications
 */
export async function getRecentNotifications(
  event?: NotificationEvent,
  limit: number = 50
): Promise<any[]> {
  try {
    const notifications = await prisma.notification.findMany({
      where: event ? { event } : undefined,
      orderBy: { sentAt: 'desc' },
      take: limit,
    })

    return notifications
  } catch (error) {
    console.error('Error getting recent notifications:', error)
    return []
  }
}
