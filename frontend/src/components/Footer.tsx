import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-16 pb-20 sm:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white font-bold mb-4">Adify</h3>
            <p className="text-gray-400 text-sm mb-4">
              Earn real money by watching ads and playing games. Fair,
              transparent, and rewarding.
            </p>
            <p className="text-gray-500 text-xs">
              © {currentYear} AdRev Technologies (Pty) Ltd
              <br />
              South Africa
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/legal/terms"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/privacy"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/cookies"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/admob"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  AdMob Disclosure
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-bold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:support@adrevtechnologies.co.za"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  General Support
                </a>
              </li>
              <li>
                <a
                  href="mailto:privacy@adrevtechnologies.co.za"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Inquiries
                </a>
              </li>
              <li>
                <a
                  href="https://monetag.com/publishers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Monetag Publisher Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Compliance */}
          <div>
            <h3 className="text-white font-bold mb-4">Compliance</h3>
            <div className="space-y-2 text-xs text-gray-400">
              <p>✓ GDPR Compliant (EU)</p>
              <p>✓ POPIA Compliant (SA)</p>
              <p>✓ COPPA Compliant (US)</p>
              <p>✓ Play Store Ready</p>
              <p className="mt-4 text-gray-500">
                Age Requirement: 18+
                <br />
                (13-17 with parental consent)
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs text-gray-500">
          <p>AdRev Technologies (Pty) Ltd • Registered in South Africa</p>
          <p className="mt-2">
            This site uses Google AdMob to serve advertisements. See our{' '}
            <Link
              to="/legal/admob"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              AdMob Disclosure
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  )
}
