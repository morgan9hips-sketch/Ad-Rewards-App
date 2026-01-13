import Card from '../components/Card'

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>

      <Card>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-400 mb-4">Last updated: January 2024</p>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">1. Acceptance of Terms</h2>
          <p className="text-gray-300 mb-4">
            By accessing and using Ad Rewards, you accept and agree to be bound by the terms and
            provisions of this agreement.
          </p>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">2. Use of Service</h2>
          <p className="text-gray-300 mb-4">
            You must be at least 18 years old to use this service. You agree to watch ads in their
            entirety and not use any automated tools or bots.
          </p>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">3. Earnings and Payments</h2>
          <p className="text-gray-300 mb-4">
            Earnings are calculated based on completed ad views. Minimum withdrawal amount is $5.00.
            Payments are processed within 5-7 business days.
          </p>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">4. Account Termination</h2>
          <p className="text-gray-300 mb-4">
            We reserve the right to terminate accounts that violate our terms, including the use of
            bots, fraud, or other abusive behavior.
          </p>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">5. Privacy</h2>
          <p className="text-gray-300 mb-4">
            Your privacy is important to us. Please review our Privacy Policy to understand how we
            collect and use your information.
          </p>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">6. Modifications</h2>
          <p className="text-gray-300 mb-4">
            We reserve the right to modify these terms at any time. Continued use of the service
            constitutes acceptance of modified terms.
          </p>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">7. Contact</h2>
          <p className="text-gray-300 mb-4">
            For questions about these terms, please contact us at support@adrewards.com
          </p>
        </div>
      </Card>
    </div>
  )
}
