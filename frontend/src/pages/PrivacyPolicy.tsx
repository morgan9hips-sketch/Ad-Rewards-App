import Card from '../components/Card'

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>

      <Card>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-400 mb-4">Last updated: January 2024</p>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">1. Information We Collect</h2>
          <p className="text-gray-300 mb-4">
            We collect information you provide directly to us, including your email address, PayPal
            email, country, and ad viewing activity.
          </p>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">2. How We Use Your Information</h2>
          <p className="text-gray-300 mb-4">
            We use your information to provide and improve our service, process payments, communicate
            with you, and ensure platform security.
          </p>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">3. Information Sharing</h2>
          <p className="text-gray-300 mb-4">
            We do not sell your personal information. We may share information with service providers
            who assist in our operations, such as payment processors.
          </p>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">4. Cookies</h2>
          <p className="text-gray-300 mb-4">
            We use cookies to maintain your session and improve your experience. You can control
            cookies through your browser settings.
          </p>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">5. Data Security</h2>
          <p className="text-gray-300 mb-4">
            We implement appropriate security measures to protect your information. However, no method
            of transmission over the internet is 100% secure.
          </p>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">6. Your Rights</h2>
          <p className="text-gray-300 mb-4">
            You have the right to access, correct, or delete your personal information. Contact us to
            exercise these rights.
          </p>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">7. Changes to This Policy</h2>
          <p className="text-gray-300 mb-4">
            We may update this privacy policy from time to time. We will notify you of any changes by
            posting the new policy on this page.
          </p>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">8. Contact Us</h2>
          <p className="text-gray-300 mb-4">
            If you have questions about this privacy policy, please contact us at
            privacy@adrewards.com
          </p>
        </div>
      </Card>
    </div>
  )
}
