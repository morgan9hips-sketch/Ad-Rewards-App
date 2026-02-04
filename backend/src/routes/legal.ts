import express from 'express'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const router = express.Router()

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Helper function to read legal document
async function readLegalDocument(filename: string): Promise<string> {
  try {
    const filePath = path.join(__dirname, '../../../docs/legal', filename)
    const content = await fs.readFile(filePath, 'utf-8')
    return content
  } catch (error) {
    console.error(`Error reading legal document ${filename}:`, error)
    throw new Error(`Legal document not found: ${filename}`)
  }
}

// GET /api/legal/terms - Serve Terms of Service
router.get('/terms', async (req, res) => {
  try {
    const content = await readLegalDocument('TERMS_OF_SERVICE.md')
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
    res.send(content)
  } catch (error: any) {
    res.status(404).json({ error: error.message })
  }
})

// GET /api/legal/privacy - Serve Privacy Policy
router.get('/privacy', async (req, res) => {
  try {
    const content = await readLegalDocument('PRIVACY_POLICY.md')
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
    res.send(content)
  } catch (error: any) {
    res.status(404).json({ error: error.message })
  }
})

// GET /api/legal/cookies - Serve Cookie Policy
router.get('/cookies', async (req, res) => {
  try {
    const content = await readLegalDocument('COOKIE_POLICY.md')
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
    res.send(content)
  } catch (error: any) {
    res.status(404).json({ error: error.message })
  }
})

// GET /api/legal/admob - Serve AdMob Disclosure
router.get('/admob', async (req, res) => {
  try {
    const content = await readLegalDocument('ADMOB_DISCLOSURE.md')
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
    res.send(content)
  } catch (error: any) {
    res.status(404).json({ error: error.message })
  }
})

// GET /api/legal/subscription - Serve Subscription Terms
router.get('/subscription', async (req, res) => {
  try {
    const content = await readLegalDocument('SUBSCRIPTION_TERMS.md')
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
    res.send(content)
  } catch (error: any) {
    res.status(404).json({ error: error.message })
  }
})

// GET /api/legal/withdrawal - Serve Withdrawal Policy
router.get('/withdrawal', async (req, res) => {
  try {
    const content = await readLegalDocument('WITHDRAWAL_POLICY.md')
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
    res.send(content)
  } catch (error: any) {
    res.status(404).json({ error: error.message })
  }
})

// GET /api/legal/delete-account - Serve Delete Account Instructions
router.get('/delete-account', async (req, res) => {
  try {
    const content = await readLegalDocument('DELETE_ACCOUNT.md')
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
    res.send(content)
  } catch (error: any) {
    res.status(404).json({ error: error.message })
  }
})

export default router
