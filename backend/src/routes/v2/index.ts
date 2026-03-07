import { Router } from 'express'
import { v2FeatureFlag } from '../../middleware/v2-feature-flag.js'

// Import V2 routes
import healthRoutes from './health.js'

const router = Router()

// Apply V2 feature flag to all V2 endpoints
router.use(v2FeatureFlag)

// V2 Routes
router.use('/health', healthRoutes)

export default router
