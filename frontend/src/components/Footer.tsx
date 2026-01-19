import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Ad Rewards</h3>
            <p className="text-gray-400 text-sm mb-4">
              Earn real money by watching ads. Simple, transparent, and fully
              compliant with global advertising standards.
            </p>
            <p className="text-gray-500 text-xs">
              © 2026 Ad Rewards. All rights reserved.
            </p>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="text-white font-semibold mb-4">Information</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/rewards-info"
                  className="text-gray-400 hover:text-blue-400 text-sm transition-colors"
                >
                  How Rewards Work
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-blue-400 text-sm transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-400 hover:text-blue-400 text-sm transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/admob-compliance"
                  className="text-gray-400 hover:text-blue-400 text-sm transition-colors"
                >
                  Advertising Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:support@adrewards.com"
                  className="text-gray-400 hover:text-blue-400 text-sm transition-colors"
                >
                  Contact Support
                </a>
              </li>
              <li>
                <a
                  href="mailto:privacy@adrewards.com"
                  className="text-gray-400 hover:text-blue-400 text-sm transition-colors"
                >
                  Privacy Questions
                </a>
              </li>
              <li>
                <a
                  href="mailto:compliance@adrewards.com"
                  className="text-gray-400 hover:text-blue-400 text-sm transition-colors"
                >
                  Compliance Issues
                </a>
              </li>
            </ul>
          </div>

          {/* Compliance Badges */}
          <div>
            <h4 className="text-white font-semibold mb-4">Compliance</h4>
            <div className="space-y-3">
              <div className="bg-blue-900/30 border border-blue-500/30 p-2 rounded text-center">
                <p className="text-blue-400 text-xs font-medium">
                  GDPR Compliant
                </p>
                <p className="text-gray-400 text-xs">EU Data Protection</p>
              </div>
              <div className="bg-green-900/30 border border-green-500/30 p-2 rounded text-center">
                <p className="text-green-400 text-xs font-medium">
                  Ad Network Certified
                </p>
                <p className="text-gray-400 text-xs">Premium Partners</p>
              </div>
              <div className="bg-purple-900/30 border border-purple-500/30 p-2 rounded text-center">
                <p className="text-purple-400 text-xs font-medium">
                  CCPA Compliant
                </p>
                <p className="text-gray-400 text-xs">California Privacy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-500 text-xs">
              Ad Rewards operates in full compliance with advertising network
              policies and local financial regulations.
            </div>
            <div className="flex space-x-4">
              <span className="text-gray-500 text-xs">🔒 Secure Platform</span>
              <span className="text-gray-500 text-xs">
                🌍 Global Compliance
              </span>
              <span className="text-gray-500 text-xs">📱 Mobile Optimized</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
