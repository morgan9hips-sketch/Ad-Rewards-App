import { useState } from 'react'
import Button from './Button'

interface RewardDisclosureProps {
  onDismiss?: () => void
}

export default function RewardDisclosure({ onDismiss }: RewardDisclosureProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleDismiss = () => {
    setIsOpen(false)
    if (onDismiss) {
      onDismiss()
    }
  }

  return (
    <>
      {/* Info icon trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
        aria-label="Reward information"
      >
        i
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">
              ℹ️ How Rewards Work
            </h3>
            <p className="text-gray-300 mb-4">
              Rewards are earned through active participation. Ads may appear during sessions to support the platform.
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Your engagement helps us provide this service and share revenue with our community.
            </p>
            <Button fullWidth onClick={handleDismiss}>
              Got It
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
