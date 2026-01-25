import Button from './Button'

interface WithdrawalSuccessModalProps {
  coinsWithdrawn: number
  amountReceived: number
  currencyCode: string
  rateMultiplier: number
  transactionId: string
  paypalEmail: string
  onClose: () => void
}

export default function WithdrawalSuccessModal({
  coinsWithdrawn,
  amountReceived,
  currencyCode,
  rateMultiplier,
  transactionId,
  paypalEmail,
  onClose,
}: WithdrawalSuccessModalProps) {
  const getMultiplierMessage = () => {
    if (rateMultiplier > 1.0) {
      return `Your region's ad revenue was ${((rateMultiplier - 1) * 100).toFixed(0)}% above average this month! 🔥`
    } else if (rateMultiplier < 1.0) {
      return `Your region's ad revenue was ${((1 - rateMultiplier) * 100).toFixed(0)}% below average this month.`
    } else {
      return 'Your region\'s ad revenue was at average this month.'
    }
  }

  const getTip = () => {
    if (rateMultiplier < 1.0) {
      return '💡 Tip: Next time, watch for 1.0x+ rates to maximize earnings!'
    }
    return '💡 Tip: Keep earning and check the rate multiplier for best withdrawal times!'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Payment Sent to PayPal!
          </h2>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-sm">Coins Withdrawn:</span>
              <span className="text-white font-semibold">
                {coinsWithdrawn.toLocaleString()} AdCoins
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Amount Received:</span>
              <span className="text-green-500 font-bold text-lg">
                {currencyCode} {amountReceived.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">
              Regional Performance:
            </div>
            <div className="text-white font-semibold mb-1">
              {rateMultiplier.toFixed(2)}x
              {rateMultiplier > 1.0 && <span className="ml-2">🔥</span>}
              {rateMultiplier < 1.0 && <span className="ml-2">⚠️</span>}
            </div>
            <div className="text-xs text-gray-400">
              {getMultiplierMessage()}
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-gray-400">Transaction ID:</span>
              <span className="text-white font-mono">{transactionId}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">PayPal Email:</span>
              <span className="text-white truncate ml-2">{paypalEmail}</span>
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
            <p className="text-blue-300 text-sm text-center">
              {getTip()}
            </p>
          </div>
        </div>

        <Button fullWidth onClick={onClose}>
          View Transaction History
        </Button>
      </div>
    </div>
  )
}
