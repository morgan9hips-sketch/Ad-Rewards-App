import cron from 'node-cron'
import { updateAllCoinValuations } from '../services/coinValuationService.js'

/**
 * Schedule coin valuation update job
 * Runs every 6 hours
 */
export function scheduleCoinValuationJob() {
  // Run every 6 hours (at 00:00, 06:00, 12:00, 18:00)
  cron.schedule('0 */6 * * *', async () => {
    console.log('⏰ Running coin valuation update job...')
    try {
      await updateAllCoinValuations()
      console.log('✅ Coin valuations updated successfully')
    } catch (error) {
      console.error('❌ Error updating coin valuations:', error)
    }
  })

  console.log('🕒 Coin valuation update job scheduled (every 6 hours)')
}
