import { Router } from 'express'
import { v2FeatureFlag } from '../../middleware/v2-feature-flag.js'

// Import V2 routes
import healthRoutes from './health.js'
import walletRoutes from './wallet.js'
import rewardsRoutes from './rewards.js'
import ledgerRoutes from './ledger.js'
import claimsRoutes from './claims.js'
import adminRoutes from './admin.js'
import tasksRoutes from './tasks.js'
import postbackRoutes from './postback.js'

const router = Router()

// Apply V2 feature flag to all V2 endpoints
router.use(v2FeatureFlag)

// V2 Routes
router.use('/health', healthRoutes)
router.use('/wallet', walletRoutes)
router.use('/rewards', rewardsRoutes)
router.use('/ledger', ledgerRoutes)
router.use('/claims', claimsRoutes)
router.use('/admin', adminRoutes)
router.use('/tasks', tasksRoutes)
router.use('/postback', postbackRoutes)

export default router
