import { Router } from 'express'
import { v2FeatureFlag } from '../../middleware/v2-feature-flag.js'
import walletRoutes from './wallet.js'
import rewardsRoutes from './rewards.js'
import claimsRoutes from './claims.js'
import adminCreditRoutes from './admin/credit.js'

const router = Router()

// Gate all V2 routes behind the feature flag
router.use(v2FeatureFlag)

// V2 endpoint registry:
//   GET  /api/v2/wallet          – authenticated user's coin balance
//   GET  /api/v2/rewards         – public reward catalog
//   POST /api/v2/claims          – submit a claim
//   GET  /api/v2/claims          – list authenticated user's claims
//   POST /api/v2/admin/credit    – (admin) credit coins to a user
router.use('/wallet', walletRoutes)
router.use('/rewards', rewardsRoutes)
router.use('/claims', claimsRoutes)
router.use('/admin', adminCreditRoutes)

export default router
