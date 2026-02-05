#!/usr/bin/env node
// Custom validation runner for deployment readiness

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

type ValidationResult = {
  passed: boolean
  message: string
  critical: boolean
}

async function validateEnvironment(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = []
  
  // Check Wise token
  const wiseToken = process.env.WISE_API_TOKEN
  results.push({
    passed: !!(wiseToken && wiseToken.length > 25 && !wiseToken.includes('your_')),
    message: 'Wise API Token configured',
    critical: true
  })
  
  // Check Wise profile
  const wiseProfile = process.env.WISE_PROFILE_ID
  results.push({
    passed: !!(wiseProfile && wiseProfile.length > 5 && !wiseProfile.includes('your_')),
    message: 'Wise Profile ID configured',
    critical: true
  })
  
  // Check Wise mode
  const wiseMode = process.env.WISE_MODE
  results.push({
    passed: wiseMode === 'sandbox' || wiseMode === 'live',
    message: 'Wise Mode properly set',
    critical: true
  })
  
  return results
}

async function validateDatabase(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = []
  
  try {
    const { stdout } = await execAsync(
      `psql "${process.env.DATABASE_URL}" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='signup_bonuses'"`
    )
    results.push({
      passed: stdout.includes('1'),
      message: 'signup_bonuses table exists',
      critical: true
    })
  } catch {
    results.push({
      passed: false,
      message: 'Database connection or signup_bonuses table check failed',
      critical: true
    })
  }
  
  try {
    const { stdout } = await execAsync(
      `psql "${process.env.DATABASE_URL}" -c "SELECT column_name FROM information_schema.columns WHERE table_name='withdrawals' AND column_name='wise_transfer_id'"`
    )
    results.push({
      passed: stdout.includes('wise_transfer_id'),
      message: 'Wise columns added to withdrawals',
      critical: true
    })
  } catch {
    results.push({
      passed: false,
      message: 'Wise column check failed',
      critical: true
    })
  }
  
  return results
}

async function validateDocuments(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = []
  const fs = await import('fs')
  const path = await import('path')
  
  const docsPath = path.join(process.cwd(), '..', 'docs', 'legal')
  const files = ['TERMS_OF_SERVICE.md', 'PRIVACY_POLICY.md', 'WITHDRAWAL_POLICY.md']
  
  for (const file of files) {
    const filePath = path.join(docsPath, file)
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      const hasPayPal = content.includes('PayPal')
      results.push({
        passed: !hasPayPal,
        message: `${file} PayPal references removed`,
        critical: true
      })
    }
  }
  
  return results
}

async function main() {
  console.log('🔍 Running deployment validation...\n')
  
  const envResults = await validateEnvironment()
  const dbResults = await validateDatabase()
  const docResults = await validateDocuments()
  
  const allResults = [...envResults, ...dbResults, ...docResults]
  
  let failed = 0
  allResults.forEach(r => {
    const icon = r.passed ? '✅' : '❌'
    console.log(`${icon} ${r.message}`)
    if (!r.passed && r.critical) failed++
  })
  
  console.log(`\n${failed === 0 ? '✅ All checks passed' : `❌ ${failed} critical checks failed`}`)
  process.exit(failed === 0 ? 0 : 1)
}

main().catch(console.error)
