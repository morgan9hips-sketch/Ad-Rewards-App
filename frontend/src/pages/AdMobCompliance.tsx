import Card from '../components/Card'

export default function AdMobCompliance() {
  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <h1 className="text-3xl font-bold text-white mb-6">
        Advertising Networks & Compliance Policy
      </h1>

      <Card>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-400 mb-4">Last updated: January 15, 2026</p>
          <p className="text-blue-400 mb-6 text-sm font-medium">
            🛡️ Full transparency about our advertising policies and compliance
            measures.
          </p>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">
            🎯 Our Advertising Partners
          </h2>

          <p className="text-gray-300 mb-4">
            Ad Rewards partners with multiple premium advertising networks
            including
            <strong> Google AdMob</strong>, and other certified ad providers to
            serve high-quality advertisements. We work with trusted networks
            that maintain strict quality standards and provide relevant, safe
            ads to users.
          </p>

          <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg mb-6">
            <h3 className="text-blue-400 font-semibold mb-2">
              🤝 Why We Choose Premium Networks
            </h3>
            <ul className="text-gray-300 space-y-1">
              <li>• Industry-leading privacy protection</li>
              <li>• Strict quality standards for advertisements</li>
              <li>• Global compliance with local regulations</li>
              <li>• Transparent revenue sharing model</li>
            </ul>
          </div>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">
            📍 Geographic Currency Compliance
          </h2>

          <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-lg mb-6">
            <h3 className="text-yellow-400 font-semibold mb-2">
              🚫 Critical Compliance Requirement
            </h3>
            <p className="text-gray-300 mb-3">
              To comply with advertising network policies and local financial
              regulations, we enforce
              <strong> strict geographic currency restrictions</strong>:
            </p>
            <ul className="text-gray-300 space-y-2">
              <li>
                <strong>🇿🇦 South African Users:</strong> Must use ZAR (South
                African Rand) only. USD access is completely prohibited to
                comply with local financial regulations.
              </li>
              <li>
                <strong>🌍 Other Regions:</strong> Currency assignment based on
                verified geographic location.
              </li>
              <li>
                <strong>🔒 No Manual Selection:</strong> Users cannot choose
                their currency - it's automatically assigned based on location
                verification.
              </li>
            </ul>
          </div>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">
            🛡️ VPN and Proxy Prevention
          </h2>

          <p className="text-gray-300 mb-4">
            To maintain compliance with AdMob policies and prevent circumvention
            of geographic restrictions, we implement comprehensive VPN and proxy
            detection:
          </p>

          <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg mb-6">
            <h3 className="text-red-400 font-semibold mb-2">
              ⚠️ VPN Detection Systems
            </h3>
            <ul className="text-gray-300 space-y-1">
              <li>
                • Real-time IP address analysis and geolocation verification
              </li>
              <li>
                • ASN (Autonomous System Number) checking for VPN providers
              </li>
              <li>• Multiple external IP verification services</li>
              <li>• Device fingerprinting and consistency checks</li>
              <li>• Behavioral analysis for location spoofing detection</li>
            </ul>
            <p className="text-red-400 mt-3 text-sm font-medium">
              Users detected using VPNs or proxies will be blocked from
              accessing the platform to ensure regulatory compliance.
            </p>
          </div>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">
            📊 Data Collection for Advertising
          </h2>

          <h3 className="text-lg font-semibold text-blue-400 mt-4 mb-2">
            Information AdMob Collects
          </h3>
          <p className="text-gray-300 mb-3">
            Through Google AdMob, the following information may be collected to
            serve relevant ads:
          </p>
          <ul className="text-gray-300 ml-6 mb-4 space-y-1">
            <li>• Device information (model, operating system, browser)</li>
            <li>• Mobile advertising identifiers (GAID, IDFA)</li>
            <li>• Approximate location (for geographic ad targeting)</li>
            <li>• App usage patterns and ad interaction data</li>
            <li>• Network connection type and carrier information</li>
          </ul>

          <h3 className="text-lg font-semibold text-blue-400 mt-4 mb-2">
            How This Data Is Used
          </h3>
          <ul className="text-gray-300 ml-6 mb-4 space-y-1">
            <li>• Serving relevant and appropriate advertisements</li>
            <li>• Measuring ad performance and effectiveness</li>
            <li>• Preventing fraud and invalid ad clicks</li>
            <li>• Optimizing ad delivery and user experience</li>
            <li>• Complying with local advertising regulations</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">
            🎭 Ad Quality and Content Standards
          </h2>

          <p className="text-gray-300 mb-4">
            All advertisements served through our platform must comply with
            Google's strict content policies:
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-lg">
              <h4 className="text-green-400 font-semibold mb-2">
                ✅ Allowed Content
              </h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Family-friendly products and services</li>
                <li>• Educational and informational content</li>
                <li>• Legitimate business promotions</li>
                <li>• Entertainment and gaming (age-appropriate)</li>
              </ul>
            </div>

            <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
              <h4 className="text-red-400 font-semibold mb-2">
                ❌ Prohibited Content
              </h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Adult or sexually explicit material</li>
                <li>• Violence, weapons, or dangerous products</li>
                <li>• Illegal substances or activities</li>
                <li>• Misleading or fraudulent claims</li>
              </ul>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">
            💰 Revenue Sharing and Transparency
          </h2>

          <p className="text-gray-300 mb-4">
            We believe in complete transparency about how advertising revenue is
            shared:
          </p>

          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <h4 className="text-white font-semibold mb-3">
              Revenue Distribution Model
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">User Rewards:</span>
                <span className="text-green-400 font-bold">70%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Platform Operations:</span>
                <span className="text-blue-400 font-bold">20%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">AdMob Revenue Share:</span>
                <span className="text-yellow-400 font-bold">10%</span>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">
            🔒 Privacy Protection Measures
          </h2>

          <h3 className="text-lg font-semibold text-blue-400 mt-4 mb-2">
            Your Control Over Ad Personalization
          </h3>
          <ul className="text-gray-300 ml-6 mb-4 space-y-1">
            <li>
              • You can opt out of personalized ads through your device settings
            </li>
            <li>• Google's Ad Settings allow you to control ad preferences</li>
            <li>
              • We respect \"Do Not Track\" signals when technically feasible
            </li>
            <li>• Data minimization - we only collect what's necessary</li>
          </ul>

          <h3 className="text-lg font-semibold text-blue-400 mt-4 mb-2">
            Data Protection Standards
          </h3>
          <ul className="text-gray-300 ml-6 mb-4 space-y-1">
            <li>• All data transmission is encrypted (HTTPS/TLS)</li>
            <li>• We follow GDPR requirements for EU users</li>
            <li>• Regular security audits and vulnerability assessments</li>
            <li>• Limited data retention periods</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">
            📱 Technical Implementation
          </h2>

          <p className="text-gray-300 mb-4">
            Our AdMob integration follows industry best practices for
            performance and user experience:
          </p>

          <ul className="text-gray-300 ml-6 mb-6 space-y-1">
            <li>• Optimized ad loading to minimize app performance impact</li>
            <li>• Caching mechanisms to reduce data usage</li>
            <li>• Error handling to gracefully manage failed ad loads</li>
            <li>• User-initiated ad viewing (no automatic ad play)</li>
            <li>• Clear reward confirmation before ad display</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">
            ⚖️ Regulatory Compliance
          </h2>

          <div className="space-y-4 mb-6">
            <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
              <h4 className="text-blue-400 font-semibold mb-2">
                🇪🇺 GDPR Compliance (European Union)
              </h4>
              <p className="text-gray-300 text-sm">
                Full compliance with General Data Protection Regulation
                including consent mechanisms, data portability, and the right to
                erasure.
              </p>
            </div>

            <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-lg">
              <h4 className="text-purple-400 font-semibold mb-2">
                🇺🇸 CCPA Compliance (California)
              </h4>
              <p className="text-gray-300 text-sm">
                California Consumer Privacy Act compliance including disclosure
                of data collection and consumer rights to opt-out of data sales.
              </p>
            </div>

            <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-lg">
              <h4 className="text-green-400 font-semibold mb-2">
                🇿🇦 POPIA Compliance (South Africa)
              </h4>
              <p className="text-gray-300 text-sm">
                Protection of Personal Information Act compliance with
                additional currency restrictions to meet local financial
                regulations.
              </p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">
            📞 Contact and Reporting
          </h2>

          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <h4 className="text-white font-semibold mb-3">
              Report Issues or Concerns
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-blue-400 font-medium mb-2">
                  Ad Quality Issues:
                </h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Inappropriate ad content</li>
                  <li>• Technical ad problems</li>
                  <li>• Misleading advertisements</li>
                  <li>• Email: ads@adrewards.com</li>
                </ul>
              </div>
              <div>
                <h5 className="text-blue-400 font-medium mb-2">
                  Privacy Concerns:
                </h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Data collection questions</li>
                  <li>• Privacy rights requests</li>
                  <li>• GDPR inquiries</li>
                  <li>• Email: privacy@adrewards.com</li>
                </ul>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mt-6 mb-3">
            🔄 Policy Updates
          </h2>

          <p className="text-gray-300 mb-4">
            This AdMob compliance policy may be updated to reflect changes in:
          </p>
          <ul className="text-gray-300 ml-6 mb-4 space-y-1">
            <li>• Google AdMob policies and requirements</li>
            <li>• Local and international advertising regulations</li>
            <li>• Our platform features and capabilities</li>
            <li>• User feedback and industry best practices</li>
          </ul>

          <p className="text-gray-300 mb-6">
            We will notify users of material changes through email and prominent
            platform notices.
          </p>

          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 p-6 rounded-lg">
            <h3 className="text-white font-bold mb-3">🌟 Our Commitment</h3>
            <p className="text-gray-300 mb-3">
              Ad Rewards is committed to operating the most transparent and
              compliant advertising reward platform possible. We prioritize user
              privacy, regulatory compliance, and fair revenue sharing.
            </p>
            <p className="text-blue-400 text-sm font-medium">
              Questions? Concerns? We're here to help - contact us at
              compliance@adrewards.com
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
