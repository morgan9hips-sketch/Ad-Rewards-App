import { Link } from 'react-router-dom'
import Card from '../components/Card'

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>

      <Card>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-400 mb-6"><strong>Effective Date:</strong> January 16, 2026</p>
          <p className="text-gray-300 mb-6">
            Welcome to Ad Rewards ("we," "our," or "us"). By accessing or using our service, you agree to be bound by these Terms of Service. Please read them carefully.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Service Description</h2>
          <p className="text-gray-300 mb-4">
            Ad Rewards is a web-based rewards platform that allows users to earn virtual currency (AdCoins) by participating in rewarded sessions. Users can convert earned AdCoins to cash and withdraw funds via PayPal.
          </p>
          <p className="text-gray-300 mb-4">
            <strong>Important Clarifications:</strong>
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li><strong>Virtual Rewards:</strong> AdCoins are virtual rewards with no inherent monetary value until converted through our platform's revenue-sharing process.</li>
            <li><strong>Revenue Sharing, Not Financial Services:</strong> We share advertising revenue with users. We do not provide financial services, loans, investments, or guaranteed income.</li>
            <li><strong>No Guaranteed Earnings:</strong> Earnings depend entirely on advertising revenue received, which varies based on advertiser demand, geographic location, ad performance, and other market factors beyond our control.</li>
            <li><strong>Session-Based Participation:</strong> Rewards are earned through active participation in sessions. Advertisements may appear during sessions to support the platform.</li>
            <li><strong>Payment Processing:</strong> PayPal is our payment processor. We do not handle money transmission directly. All payments are subject to PayPal's terms and conditions.</li>
            <li><strong>Platform Purpose:</strong> This is a rewards program for entertainment and supplemental income, not a primary income source or employment relationship.</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Eligibility and Account Requirements</h2>
          
          <h3 className="text-lg font-semibold text-white mt-6 mb-3">2.1 Age Requirements</h3>
          <p className="text-gray-300 mb-4">
            You must be at least 18 years of age to create an account and use this service. If you are between 13 and 17 years old, you may only use the service with the consent and supervision of a parent or legal guardian who agrees to be bound by these Terms.
          </p>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">2.2 Account Rules</h3>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li><strong>One Account Per Person:</strong> You may only create and maintain one account. Multiple accounts will result in suspension of all accounts and forfeiture of earnings.</li>
            <li><strong>Accurate Information:</strong> You must provide accurate and truthful information, including your PayPal email address. We are not responsible for failed payments due to incorrect information.</li>
            <li><strong>Account Security:</strong> You are responsible for maintaining the security of your account credentials. Notify us immediately of any unauthorized access.</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">3. User Obligations and Prohibited Activities</h2>
          
          <h3 className="text-lg font-semibold text-white mt-6 mb-3">3.1 Compliance with Policies</h3>
          <p className="text-gray-300 mb-4">
            You agree to comply with:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li>These Terms of Service</li>
            <li>Our <Link to="/privacy" className="text-blue-400 hover:text-blue-300 underline">Privacy Policy</Link></li>
            <li>Google's advertising policies and terms of service</li>
            <li>PayPal's terms of service and acceptable use policies</li>
            <li>All applicable local, state, national, and international laws</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">3.2 Prohibited Activities</h3>
          <p className="text-gray-300 mb-4">
            You must NOT:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li>Use bots, scripts, automation tools, or any artificial means to participate in sessions or generate AdCoins</li>
            <li>Create fake accounts or use another person's account</li>
            <li>Generate fraudulent interactions or clicks</li>
            <li>Use VPNs, proxies, or other tools to manipulate your location for higher revenue</li>
            <li>Attempt to manipulate, exploit, or abuse the rewards system</li>
            <li>Share, sell, or transfer your account to another person</li>
            <li>Interfere with or disrupt the service or servers</li>
            <li>Reverse engineer, decompile, or attempt to extract source code</li>
            <li>Engage in any activities that violate advertising partner policies, including incentivized clicking or ad fraud</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Rewards Program</h2>
          
          <h3 className="text-lg font-semibold text-white mt-6 mb-3">4.1 Earning AdCoins</h3>
          <p className="text-gray-300 mb-4">
            <strong>AdCoin Issuance:</strong> You earn AdCoins by completing rewarded sessions. The amount earned per session may vary. AdCoins are virtual rewards credited to your account upon successful completion of the session.
          </p>
          <p className="text-gray-300 mb-4">
            <strong>Session Availability:</strong> Session availability depends on advertiser demand and may vary by location, time of day, and other factors. We do not guarantee a specific number of sessions will be available.
          </p>
          <p className="text-gray-300 mb-4">
            <strong>Advertising Disclosure:</strong> Advertisements may appear during sessions to support the platform. You are never required or incentivized to click on advertisements.
          </p>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">4.2 AdCoin to Cash Conversion</h3>
          <p className="text-gray-300 mb-4">
            <strong>Conversion Process:</strong> AdCoins are converted to cash on a monthly basis, typically within the first 5 business days of each month.
          </p>
          <p className="text-gray-300 mb-4">
            <strong>Conversion Rate Calculation:</strong> The conversion rate is calculated using the following formula:
          </p>
          <div className="bg-gray-800 p-4 rounded mb-4 font-mono text-sm text-gray-200">
            Conversion Rate = (Total Platform Revenue × 85%) ÷ Total AdCoins Earned Across All Users
          </div>
          <p className="text-gray-300 mb-4">
            <strong>Variable Rate:</strong> The conversion rate varies each month based on actual advertising revenue received. We retain 15% to cover operational costs, fraud prevention, payment processing fees, and platform maintenance.
          </p>
          <p className="text-gray-300 mb-4">
            <strong>No Guarantee:</strong> We make no guarantee regarding the conversion rate or the amount you will earn. Rates may increase or decrease based on market conditions entirely outside our control.
          </p>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">4.3 Withdrawals and Payments</h3>
          <p className="text-gray-300 mb-4">
            <strong>Minimum Withdrawal:</strong> The minimum withdrawal amount is $10.00 USD equivalent. You may only request a withdrawal once your cash balance reaches this threshold.
          </p>
          <p className="text-gray-300 mb-4">
            <strong>Payment Method:</strong> Payments are processed exclusively through PayPal. You must provide a valid PayPal email address to receive payments.
          </p>
          <p className="text-gray-300 mb-4">
            <strong>Processing Time:</strong> Withdrawal requests are reviewed for fraud and processed within 14 business days of approval. We reserve the right to conduct additional verification if fraud is suspected.
          </p>
          <p className="text-gray-300 mb-4">
            <strong>Payment Processor Limitations:</strong> We are not liable if PayPal rejects, delays, or reverses a payment. Issues with PayPal payments must be resolved directly with PayPal.
          </p>
          <p className="text-gray-300 mb-4">
            <strong>Fraud Prevention:</strong> We reserve the right to deny, delay, or reverse any withdrawal request if we suspect fraudulent activity, policy violations, or suspicious behavior. Suspected fraud will result in account termination and forfeiture of all pending earnings.
          </p>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">4.4 Balance Expiry and Conversion</h3>
          
          <p className="text-gray-300 mb-4">
            <strong>Coin Expiry:</strong> Coin balances expire after 30 consecutive days of account inactivity. "Inactivity" means no login to the platform. You will receive a warning notification 7 days before expiry. Expired coins cannot be recovered or reinstated.
          </p>
          
          <p className="text-gray-300 mb-4">
            <strong>Cash Wallet Expiry:</strong> Cash wallet balances expire after 90 consecutive days of account inactivity. "Inactivity" means no login, ad views, or withdrawal attempts. You will receive an email notification 14 days before expiry (if email is configured). Expired cash balances are forfeited and cannot be recovered.
          </p>
          
          <p className="text-gray-300 mb-4">
            <strong>Conversion Threshold:</strong> Coins are NOT automatically converted to cash until you reach the minimum withdrawal threshold (currently R150 ZAR / 150,000 coins). Below this threshold, balances remain as coins only and are subject to coin expiry rules (30 days). Once the threshold is reached, coins automatically convert to cash at the prevailing conversion rate (1,000 coins = R1 ZAR). Cash balances are subject to the 90-day expiry rule.
          </p>
          
          <p className="text-gray-300 mb-4">
            <strong>Rationale:</strong> These policies ensure platform sustainability and prevent accumulation of unclaimed, inactive balances. Users are encouraged to remain active and withdraw earnings regularly.
          </p>
          
          <p className="text-gray-300 mb-4">
            <strong>Reactivation:</strong> Logging in to your account resets the inactivity timer for both coins and cash.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">5. Limitation of Liability</h2>
          
          <p className="text-gray-300 mb-4">
            <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong>
          </p>
          
          <h3 className="text-lg font-semibold text-white mt-6 mb-3">5.1 Nature of Relationship</h3>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li>This is a <strong>rewards program</strong>, not an employment relationship. You are not an employee, contractor, agent, or partner of Ad Rewards.</li>
            <li>You are not entitled to any employment benefits, including but not limited to minimum wage, overtime pay, workers' compensation, unemployment insurance, or health benefits.</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">5.2 No Guarantee of Earnings</h3>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li>We make <strong>no guarantee</strong> regarding earnings, conversion rates, or the availability of advertisements.</li>
            <li>Advertising revenue fluctuates based on market conditions beyond our control. We are not responsible for decreases in revenue or earnings.</li>
            <li>We do not guarantee the service will be available continuously or error-free.</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">5.3 Service Interruptions</h3>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li>We are not liable for service interruptions, downtime, technical issues, or third-party service failures (including Google AdMob or PayPal).</li>
            <li>We may suspend or discontinue the service at any time without prior notice.</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">5.4 Tax Obligations</h3>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li>You are solely responsible for reporting and paying all applicable taxes on earnings received through our service.</li>
            <li>For users in the United States earning more than $600 USD per year, we will issue IRS Form 1099-MISC as required by law.</li>
            <li>We may withhold taxes or report earnings to tax authorities as required by local, state, or national law.</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">5.5 Maximum Liability</h3>
          <p className="text-gray-300 mb-4">
            Our total liability to you for any claims arising from or related to your use of the service shall not exceed the total amount you have been paid through the service in the 12 months preceding the claim, or $100 USD, whichever is less.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">6. Account Termination</h2>
          
          <h3 className="text-lg font-semibold text-white mt-6 mb-3">6.1 Termination by Us</h3>
          <p className="text-gray-300 mb-4">
            We reserve the right to suspend or terminate your account at any time, with or without cause, and with or without notice, including but not limited to:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li>Violation of these Terms of Service</li>
            <li>Fraudulent activity or suspicious behavior</li>
            <li>Use of bots, automation, or other prohibited tools</li>
            <li>Creation of multiple accounts</li>
            <li>Violation of Google AdMob policies</li>
            <li>Providing false or inaccurate information</li>
            <li>Abuse of the service or other users</li>
            <li>Any reason we deem necessary to protect the integrity of the service</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">6.2 Effect of Termination</h3>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li><strong>Forfeiture of Earnings:</strong> Upon termination for cause (including fraud or policy violations), you will forfeit all pending coins and cash balances. No refund or payment will be issued.</li>
            <li><strong>Account Access:</strong> You will immediately lose access to your account and all associated data.</li>
            <li><strong>No Liability:</strong> We are not liable for any losses, damages, or consequences resulting from account termination.</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">6.3 Voluntary Account Closure</h3>
          <p className="text-gray-300 mb-4">
            You may close your account at any time through the Settings page. Upon voluntary closure:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
            <li>You may request withdrawal of your cash balance if it meets the minimum threshold</li>
            <li>Pending coins will be forfeited (only converted cash can be withdrawn)</li>
            <li>Your account data will be retained for 7 years for tax compliance purposes, as described in our Privacy Policy</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">7. Intellectual Property</h2>
          
          <p className="text-gray-300 mb-4">
            <strong>Our Rights:</strong> All content, features, functionality, logos, trademarks, service marks, and trade names displayed on the service are the exclusive property of Ad Rewards and are protected by copyright, trademark, and other intellectual property laws.
          </p>
          <p className="text-gray-300 mb-4">
            <strong>License to Us:</strong> By using the service, you grant us a worldwide, non-exclusive, royalty-free license to use, store, and process your account data and usage information as described in our <Link to="/privacy" className="text-blue-400 hover:text-blue-300 underline">Privacy Policy</Link>.
          </p>
          <p className="text-gray-300 mb-4">
            <strong>Your License:</strong> We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the service for its intended purpose in accordance with these Terms.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">8. Dispute Resolution</h2>
          
          <h3 className="text-lg font-semibold text-white mt-6 mb-3">8.1 Governing Law</h3>
          <p className="text-gray-300 mb-4">
            These Terms of Service are governed by and construed in accordance with the laws of the Republic of South Africa, without regard to its conflict of law principles.
          </p>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">8.2 Jurisdiction</h3>
          <p className="text-gray-300 mb-4">
            Any disputes, claims, or controversies arising out of or relating to these Terms or the service shall be resolved exclusively in the courts of South Africa. You consent to the exclusive jurisdiction and venue of such courts.
          </p>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">8.3 No Class Actions</h3>
          <p className="text-gray-300 mb-4">
            You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action. You waive any right to participate in a class action lawsuit or class-wide arbitration.
          </p>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">8.4 Informal Resolution</h3>
          <p className="text-gray-300 mb-4">
            Before filing any formal claim, you agree to contact us at <a href="mailto:admin@adrevtechnologies.com" className="text-blue-400 hover:text-blue-300 underline">admin@adrevtechnologies.com</a> to attempt to resolve the dispute informally.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">9. Changes to Terms</h2>
          
          <p className="text-gray-300 mb-4">
            We reserve the right to modify, update, or replace these Terms of Service at any time at our sole discretion. Changes will be effective immediately upon posting to the service.
          </p>
          <p className="text-gray-300 mb-4">
            <strong>Notice of Changes:</strong> We will update the "Effective Date" at the top of this page when changes are made. For material changes, we may provide additional notice through email or a prominent notice on the service.
          </p>
          <p className="text-gray-300 mb-4">
            <strong>Continued Use:</strong> Your continued use of the service after changes are posted constitutes acceptance of the modified Terms. If you do not agree to the modified Terms, you must stop using the service and close your account.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">10. Miscellaneous</h2>
          
          <h3 className="text-lg font-semibold text-white mt-6 mb-3">10.1 Entire Agreement</h3>
          <p className="text-gray-300 mb-4">
            These Terms, together with our Privacy Policy, constitute the entire agreement between you and Ad Rewards regarding the service and supersede all prior agreements and understandings.
          </p>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">10.2 Severability</h3>
          <p className="text-gray-300 mb-4">
            If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions will continue in full force and effect.
          </p>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">10.3 Waiver</h3>
          <p className="text-gray-300 mb-4">
            Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
          </p>

          <h3 className="text-lg font-semibold text-white mt-6 mb-3">10.4 Assignment</h3>
          <p className="text-gray-300 mb-4">
            You may not assign or transfer these Terms or your account to any other person without our prior written consent. We may assign our rights and obligations under these Terms without restriction.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">11. Contact Information</h2>
          
          <p className="text-gray-300 mb-4">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <ul className="list-none text-gray-300 mb-6 space-y-2">
            <li><strong>Email:</strong> <a href="mailto:admin@adrevtechnologies.com" className="text-blue-400 hover:text-blue-300 underline">admin@adrevtechnologies.com</a></li>
            <li><strong>Support:</strong> <a href="mailto:admin@adrevtechnologies.com" className="text-blue-400 hover:text-blue-300 underline">admin@adrevtechnologies.com</a></li>
          </ul>

          <div className="bg-yellow-900/20 border border-yellow-600/50 rounded p-4 mt-8">
            <p className="text-yellow-200 text-sm font-semibold mb-2">⚖️ Legal Disclaimer</p>
            <p className="text-yellow-100/90 text-sm">
              These Terms of Service are provided as a starting point and should be reviewed by a qualified attorney specializing in e-commerce, privacy, and consumer protection law in South Africa before being used in production. Consult legal counsel for customization specific to your business needs.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
