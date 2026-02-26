import { Link } from 'react-router-dom'
import Card from '../components/Card'

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>

      <Card>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-400 mb-6"><strong>Effective Date:</strong> January 16, 2026</p>
          <p className="text-gray-300 mb-6">
            At Ad Rewards ("we," "our," or "us"), we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, share, and protect your information in compliance with the Protection of Personal Information Act (POPIA) of South Africa and the General Data Protection Regulation (GDPR) of the European Union.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Information We Collect</h2>
          
          <h3 className="text-lg font-semibold text-white mt-6 mb-3">1.1 Account Information</h3>
          <p className="text-gray-300 mb-4">
            When you create an account, we collect:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li><strong>Email address</strong> (required for account creation and communication)</li>
            <li><strong>PayPal email address</strong> (required for processing withdrawals)</li>
            <li><strong>Name</strong> (optional, for personalization)</li>
            <li><strong>Country preference</strong> (for currency display and regional settings)</li>
            <li><strong>Authentication data</strong> (OAuth tokens from Google or Facebook if you use social login)</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">1.2 Usage Information</h3>
          <p className="text-gray-300 mb-4">
            When you use our service, we automatically collect:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li><strong>Advertisements viewed:</strong> Tracking which ads you watch and complete</li>
            <li><strong>Coins earned and cash balance:</strong> Your rewards history and current balances</li>
            <li><strong>Withdrawal requests:</strong> History of withdrawal requests and their status</li>
            <li><strong>Transaction history:</strong> Record of all earnings and payment transactions</li>
            <li><strong>Login activity:</strong> Dates and times of account access</li>
            <li><strong>Device information:</strong> Browser type, operating system, device type, and user agent string</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">1.3 Location Information</h3>
          <p className="text-gray-300 mb-4">
            We collect your location at the <strong>country level</strong> for two essential purposes:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li><strong>Fair revenue distribution:</strong> Advertising revenue varies significantly by country. Knowing your location ensures fair coin-to-cash conversion rates.</li>
            <li><strong>Fraud prevention:</strong> Detecting VPN usage, duplicate accounts, and other suspicious activity that manipulates location for higher earnings.</li>
          </ul>
          <p className="text-gray-300 mb-4">
            Location is determined through:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li><strong>Monetag SDK</strong> (ad serving platform for measuring ad views)</li>
            <li><strong>IP address geolocation</strong> (secondary method, used for cross-verification and fraud detection)</li>
          </ul>
          <p className="text-gray-300 mb-4">
            <strong>Important:</strong> You cannot opt out of location collection as it is essential for the fair and secure operation of the service. Without accurate location data, we cannot provide the rewards program.
          </p>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">1.4 Technical and Analytics Data</h3>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li><strong>Cookies and similar technologies:</strong> See Section 7 for details</li>
            <li><strong>Log files:</strong> IP addresses, timestamps, page views, errors, and system activity</li>
            <li><strong>Performance data:</strong> Page load times, errors, and service performance metrics</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">2. How We Use Your Data</h2>
          
          <p className="text-gray-300 mb-4">
            We use your personal data for the following purposes:
          </p>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">2.1 Provide the Service</h3>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li>Create and manage your account</li>
            <li>Track advertisements viewed and coins earned</li>
            <li>Calculate monthly coin-to-cash conversion rates</li>
            <li>Process withdrawal requests and send payments via PayPal</li>
            <li>Communicate with you about your account, transactions, and service updates</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">2.2 Fraud Prevention and Security</h3>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li>Detect and prevent fraudulent activity, including bot usage, fake accounts, and manipulation</li>
            <li>Identify VPN usage and location spoofing</li>
            <li>Detect duplicate accounts and account sharing</li>
            <li>Monitor for suspicious patterns and policy violations</li>
            <li>Protect the service from abuse, spam, and unauthorized access</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">2.3 Legal Compliance</h3>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li>Comply with tax reporting requirements (e.g., IRS Form 1099-MISC for US users earning over $600/year)</li>
            <li>Respond to legal requests from law enforcement or regulatory authorities</li>
            <li>Enforce our <Link to="/terms" className="text-blue-400 hover:text-blue-300 underline">Terms of Service</Link></li>
            <li>Maintain records for audit and compliance purposes</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">2.4 Service Improvement and Analytics</h3>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li>Analyze usage patterns to improve the service and user experience</li>
            <li>Monitor service performance, errors, and technical issues</li>
            <li>Conduct research and development for new features</li>
            <li>Generate aggregated, anonymized statistics for business purposes</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">2.5 Advertising Technologies by Platform</h2>
          <p className="text-gray-300 mb-4">
            We use different advertising technologies depending on the platform you access our service from:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li><strong>Web Platform:</strong> Google AdSense for web-based advertising</li>
            <li><strong>Web Platform:</strong> Monetag for web-based advertising</li>
          </ul>
          <p className="text-gray-300 mb-4">
            Data handling and privacy practices may differ slightly between platforms based on the specific advertising technology used. Each advertising partner has its own privacy policy and data practices:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li>Google AdSense Privacy Policy: <a href="https://policies.google.com/privacy" className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a></li>
            <li>Monetag Privacy Policy: <a href="https://monetag.com/privacy" className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">Monetag Privacy Information</a></li>
            <li>Unity Ads Privacy Policy: <a href="https://unity.com/legal/privacy-policy" className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">unity.com/legal/privacy-policy</a></li>
          </ul>
          <p className="text-gray-300 mb-4">
            <strong>Important:</strong> We do not incentivize users to click on advertisements. Rewards are earned through session participation, not through clicking ads. Any ad interactions must be genuine and voluntary.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Legal Basis for Processing (GDPR)</h2>
          
          <p className="text-gray-300 mb-4">
            For users in the European Union, we process your personal data based on the following legal grounds:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li><strong>Contractual Necessity:</strong> Processing is necessary to provide the service you have requested (earning rewards, processing payments) under our Terms of Service.</li>
            <li><strong>Legitimate Interest:</strong> We have a legitimate interest in preventing fraud, improving the service, and ensuring security. We balance these interests against your privacy rights.</li>
            <li><strong>Legal Obligation:</strong> We must process data to comply with tax laws, respond to legal requests, and meet regulatory requirements.</li>
            <li><strong>Consent:</strong> For certain optional features (e.g., marketing emails, analytics cookies), we rely on your explicit consent, which you can withdraw at any time.</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">4. How We Share Your Data</h2>
          
          <p className="text-gray-300 mb-4">
            <strong>We do not sell your personal data to third parties.</strong> We share your data only in the following limited circumstances:
          </p>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">4.1 Service Providers</h3>
          <p className="text-gray-300 mb-4">
            We share data with trusted third-party service providers who assist us in operating the service:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li><strong>Advertising Partners:</strong> We use Monetag to deliver advertisements on the web platform. Monetag collects device information, location data, and ad interaction data. See their privacy policy for details.</li>
            <li><strong>PayPal:</strong> Processes withdrawal payments. We share your PayPal email address and payment amount. See <a href="https://www.paypal.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">PayPal's Privacy Policy</a>.</li>
            <li><strong>Cloud Hosting Providers:</strong> Store and process data on secure servers.</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">4.2 Legal Requirements</h3>
          <p className="text-gray-300 mb-4">
            We may disclose your data if required by law or in response to:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li>Subpoenas, court orders, or legal processes</li>
            <li>Requests from law enforcement or government authorities</li>
            <li>Tax authorities (e.g., IRS 1099 reporting for US users)</li>
            <li>Legal obligations to prevent fraud, protect rights, or ensure safety</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">4.3 Business Transfers</h3>
          <p className="text-gray-300 mb-4">
            In the event of a merger, acquisition, or sale of assets, your data may be transferred to the acquiring entity. We will notify you via email or prominent notice on the service.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">5. Data Retention</h2>
          
          <h3 className="text-lg font-semibold text-white mt-6 mb-3">5.1 Active Accounts</h3>
          <p className="text-gray-300 mb-4">
            We retain your personal data for as long as your account is active or as needed to provide the service.
          </p>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">5.2 Closed Accounts</h3>
          <p className="text-gray-300 mb-4">
            After you close your account, we retain certain data for <strong>7 years</strong> to comply with tax laws and legal obligations (e.g., maintaining records for tax audits, fraud investigations, and legal disputes).
          </p>
          <p className="text-gray-300 mb-4">
            Data retained includes:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li>Account information (email, PayPal email)</li>
            <li>Transaction history and earnings records</li>
            <li>Tax reporting information (for applicable users)</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">5.3 Log Files</h3>
          <p className="text-gray-300 mb-4">
            Security and fraud detection logs are retained for <strong>2 years</strong> to investigate suspicious activity and prevent abuse.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">6. Your Rights</h2>
          
          <p className="text-gray-300 mb-4">
            Depending on your location (especially EU/EEA under GDPR and South Africa under POPIA), you have the following rights regarding your personal data:
          </p>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">6.1 Right to Access</h3>
          <p className="text-gray-300 mb-4">
            You have the right to request a copy of the personal data we hold about you. Contact us at <a href="mailto:privacy@adrevtech.co.za" className="text-blue-400 hover:text-blue-300 underline">privacy@adrevtech.co.za</a> to submit a data access request.
          </p>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">6.2 Right to Correction</h3>
          <p className="text-gray-300 mb-4">
            You can update or correct your account information (email, PayPal email, name) through your Settings page or by contacting us.
          </p>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">6.3 Right to Deletion (Right to be Forgotten)</h3>
          <p className="text-gray-300 mb-4">
            You may request deletion of your personal data, subject to the following limitations:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li><strong>Legal Retention:</strong> We must retain transaction and tax records for 7 years as required by law.</li>
            <li><strong>Fraud Prevention:</strong> We may retain certain data to prevent future abuse (e.g., banned account identifiers).</li>
            <li><strong>Active Obligations:</strong> Data necessary for pending transactions or legal disputes cannot be deleted until resolved.</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">6.4 Right to Object</h3>
          <p className="text-gray-300 mb-4">
            You may object to processing of your data based on legitimate interests (e.g., marketing). However, you cannot object to processing necessary for service delivery or legal compliance.
          </p>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">6.5 Right to Data Portability</h3>
          <p className="text-gray-300 mb-4">
            You have the right to receive your personal data in a structured, commonly used, machine-readable format (e.g., JSON or CSV). Contact us to request a data export.
          </p>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">6.6 Right to Withdraw Consent</h3>
          <p className="text-gray-300 mb-4">
            Where we rely on consent for processing (e.g., marketing emails, optional analytics), you can withdraw consent at any time through your Settings or by contacting us.
          </p>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">6.7 Right to Lodge a Complaint</h3>
          <p className="text-gray-300 mb-4">
            If you believe we have violated your privacy rights, you have the right to lodge a complaint with:
          </p>
          <ul className="list-none text-gray-300 mb-4 space-y-2">
            <li><strong>South Africa:</strong> Information Regulator of South Africa - <a href="https://inforegulator.org.za" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">inforegulator.org.za</a></li>
            <li><strong>European Union:</strong> Your local Data Protection Authority</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">7. Cookies and Tracking Technologies</h2>
          
          <p className="text-gray-300 mb-4">
            We use cookies and similar technologies to improve your experience and operate the service. You can manage cookie preferences through your browser settings or our Cookie Consent banner.
          </p>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">7.1 Essential Cookies</h3>
          <p className="text-gray-300 mb-4">
            <strong>Purpose:</strong> Authentication, session management, security, and core service functionality.
          </p>
          <p className="text-gray-300 mb-4">
            <strong>Opt-Out:</strong> Not possible. These cookies are strictly necessary for the service to function.
          </p>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">7.2 Analytics Cookies</h3>
          <p className="text-gray-300 mb-4">
            <strong>Purpose:</strong> Track usage patterns, page views, and service performance to improve the user experience.
          </p>
          <p className="text-gray-300 mb-4">
            <strong>Opt-Out:</strong> You can decline analytics cookies through the Cookie Consent banner or your browser settings.
          </p>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">7.3 Advertising Cookies (Monetag)</h3>
          <p className="text-gray-300 mb-2">
            <strong>Purpose:</strong> Monetag uses cookies to deliver relevant ads and track ad performance. This is essential for the service to generate revenue.
          </p>
          <p className="text-gray-300 mb-4">
            <strong>Opt-Out:</strong> Not possible. Monetag cookies are required to provide the rewards program. By using the service, you consent to Monetag's data collection as described in <a href="https://monetag.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Monetag's Privacy Policy</a>.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">8. International Data Transfers</h2>
          
          <p className="text-gray-300 mb-4">
            Your data may be transferred to and stored on servers located outside of your country, including:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li><strong>Cloud hosting providers:</strong> Data is stored in secure data centers</li>
            <li><strong>Monetag:</strong> Processes data in the United States and European Union with adequate safeguards (Standard Contractual Clauses)</li>
            <li><strong>PayPal:</strong> Processes payments globally with appropriate data protection measures</li>
          </ul>
          <p className="text-gray-300 mb-4">
            We ensure that all international data transfers comply with GDPR and POPIA requirements through Standard Contractual Clauses, adequacy decisions, or other approved transfer mechanisms.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">9. Children's Privacy</h2>
          
          <p className="text-gray-300 mb-4">
            Our service is not intended for children under 18 years of age. Users aged 13-17 may only use the service with parental consent.
          </p>
          <p className="text-gray-300 mb-4">
            <strong>Children Under 13:</strong> We do not knowingly collect personal data from children under 13. If we discover that we have inadvertently collected data from a child under 13, we will delete it immediately. Parents who believe their child has provided data to us should contact us at <a href="mailto:privacy@adrevtech.co.za" className="text-blue-400 hover:text-blue-300 underline">privacy@adrevtech.co.za</a>.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">10. Data Security</h2>
          
          <p className="text-gray-300 mb-4">
            We implement industry-standard security measures to protect your personal data, including:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li>Encryption in transit (HTTPS/TLS) and at rest</li>
            <li>Secure authentication (OAuth 2.0, password hashing)</li>
            <li>Access controls and role-based permissions</li>
            <li>Regular security audits and monitoring</li>
            <li>Fraud detection systems</li>
          </ul>
          <p className="text-gray-300 mb-4">
            <strong>No Guarantee:</strong> While we strive to protect your data, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">11. Changes to This Privacy Policy</h2>
          
          <p className="text-gray-300 mb-4">
            We may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements, or service features.
          </p>
          <p className="text-gray-300 mb-4">
            <strong>Notice of Changes:</strong> We will update the "Effective Date" at the top of this page. For material changes that significantly affect your privacy rights, we will provide additional notice via email or a prominent notice on the service.
          </p>
          <p className="text-gray-300 mb-4">
            <strong>Review Regularly:</strong> We encourage you to review this Privacy Policy periodically to stay informed about how we protect your data.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">12. Contact Information</h2>
          
          <p className="text-gray-300 mb-4">
            If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:
          </p>
          <ul className="list-none text-gray-300 mb-6 space-y-2">
            <li><strong>Privacy Officer Email:</strong> <a href="mailto:admin@adrevtechnologies.com" className="text-blue-400 hover:text-blue-300 underline">admin@adrevtechnologies.com</a></li>
            <li><strong>General Support:</strong> <a href="mailto:admin@adrevtechnologies.com" className="text-blue-400 hover:text-blue-300 underline">admin@adrevtechnologies.com</a></li>
            <li><strong>Business Address:</strong> [To be provided by legal counsel]</li>
          </ul>

          <p className="text-gray-300 mb-4">
            We will respond to your inquiry within 30 days, as required by POPIA and GDPR.
          </p>

          <div className="bg-yellow-900/20 border border-yellow-600/50 rounded p-4 mt-8">
            <p className="text-yellow-200 text-sm font-semibold mb-2">⚖️ Legal Disclaimer</p>
            <p className="text-yellow-100/90 text-sm">
              This Privacy Policy is provided as a starting point and should be reviewed by a qualified attorney specializing in privacy law, POPIA compliance, and GDPR compliance before being used in production. Consult legal counsel for customization specific to your business needs and jurisdiction.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
