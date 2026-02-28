import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from './Button'

interface TermsAcceptanceModalProps {
  onAccept: () => void
}

export default function TermsAcceptanceModal({
  onAccept,
}: TermsAcceptanceModalProps) {
  const [accepted, setAccepted] = useState(false)

  const handleAccept = () => {
    if (accepted) {
      onAccept()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            📜 Welcome to Adify!
          </h2>

          <div className="space-y-4 text-gray-300">
            <p>
              Before you start earning with Adify, please take a moment to
              review and accept our Terms of Service and Privacy Policy.
            </p>

            <div className="bg-gray-800 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-white">Key Points:</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>
                  <strong className="text-white">Age Requirement:</strong> You
                  must be 18+ (or 13-17 with parental consent)
                </li>
                <li>
                  <strong className="text-white">Earning System:</strong> Earn
                  AdCoins by watching ads and playing games
                </li>
                <li>
                  <strong className="text-white">Withdrawal:</strong> Minimum
                  20,000 coins required, PayPal only, 7-14 days processing
                </li>
                <li>
                  <strong className="text-white">Balance Expiry:</strong> Coins
                  expire after 12 months of inactivity, cash after 24 months
                </li>
                <li>
                  <strong className="text-white">Prohibited:</strong> VPNs,
                  bots, multi-accounting, and fraud are strictly forbidden
                </li>
                <li>
                  <strong className="text-white">AdMob Integration:</strong> We
                  use Google AdMob to serve ads and collect advertising data
                </li>
                <li>
                  <strong className="text-white">Privacy:</strong> We collect
                  your country (not exact location), usage data, and device info
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-sm">
                Please read our complete legal documents:
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/legal/terms"
                  target="_blank"
                  className="text-blue-400 hover:text-blue-300 underline text-sm"
                >
                  📄 Terms of Service
                </Link>
                <span className="text-gray-500">•</span>
                <Link
                  to="/legal/privacy"
                  target="_blank"
                  className="text-blue-400 hover:text-blue-300 underline text-sm"
                >
                  🔒 Privacy Policy
                </Link>
                <span className="text-gray-500">•</span>
                <Link
                  to="/legal/cookies"
                  target="_blank"
                  className="text-blue-400 hover:text-blue-300 underline text-sm"
                >
                  🍪 Cookie Policy
                </Link>
                <span className="text-gray-500">•</span>
                <Link
                  to="/legal/admob"
                  target="_blank"
                  className="text-blue-400 hover:text-blue-300 underline text-sm"
                >
                  📱 AdMob Disclosure
                </Link>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">
                  I confirm that I am 18 years or older (or 13-17 with parental
                  consent) and I have read and agree to the{' '}
                  <Link
                    to="/legal/terms"
                    target="_blank"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Terms of Service
                  </Link>
                  ,{' '}
                  <Link
                    to="/legal/privacy"
                    target="_blank"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Privacy Policy
                  </Link>
                  , and{' '}
                  <Link
                    to="/legal/admob"
                    target="_blank"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    AdMob Data Usage Disclosure
                  </Link>
                  .
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAccept}
                disabled={!accepted}
                className="flex-1"
              >
                {accepted ? 'Accept & Continue' : 'Please check the box above'}
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              By accepting, you acknowledge that you understand your rights
              under GDPR, POPIA, and COPPA.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
