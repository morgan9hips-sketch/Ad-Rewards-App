import { useState, useEffect } from 'react'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'
import ProgressBar from '../components/ProgressBar'

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  progress?: number
  requirement?: number
}

export default function Badges() {
  const [loading, setLoading] = useState(true)
  const [badges, setBadges] = useState<Badge[]>([])

  useEffect(() => {
    setTimeout(() => {
      setBadges([
        {
          id: '1',
          name: 'First Steps',
          description: 'Watch your first ad',
          icon: '🎬',
          earned: true,
        },
        {
          id: '2',
          name: 'Ad Enthusiast',
          description: 'Watch 50 ads',
          icon: '⭐',
          earned: false,
          progress: 23,
          requirement: 50,
        },
        {
          id: '3',
          name: 'Century Club',
          description: 'Watch 100 ads',
          icon: '💯',
          earned: false,
          progress: 23,
          requirement: 100,
        },
        {
          id: '4',
          name: 'Early Bird',
          description: 'Watch an ad before 8 AM',
          icon: '🌅',
          earned: false,
        },
        {
          id: '5',
          name: 'Night Owl',
          description: 'Watch an ad after midnight',
          icon: '🦉',
          earned: true,
        },
        {
          id: '6',
          name: 'Weekend Warrior',
          description: 'Watch ads for 10 consecutive weekends',
          icon: '⚔️',
          earned: false,
          progress: 3,
          requirement: 10,
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  const earnedBadges = badges.filter((b) => b.earned)
  const lockedBadges = badges.filter((b) => !b.earned)

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <h1 className="text-3xl font-bold text-white mb-6">Badges 🏅</h1>

      <Card className="mb-6">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">Badges Earned</p>
          <p className="text-3xl font-bold text-yellow-500">
            {earnedBadges.length} / {badges.length}
          </p>
        </div>
      </Card>

      {earnedBadges.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Earned</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {earnedBadges.map((badge) => (
              <Card key={badge.id}>
                <div className="flex items-start gap-4">
                  <span className="text-5xl">{badge.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{badge.name}</h3>
                    <p className="text-gray-400 text-sm">{badge.description}</p>
                    <span className="inline-block mt-2 text-xs bg-green-600 text-white px-2 py-1 rounded">
                      ✓ Earned
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {lockedBadges.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Locked</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {lockedBadges.map((badge) => (
              <Card key={badge.id}>
                <div className="flex items-start gap-4">
                  <span className="text-5xl opacity-50">{badge.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-400 mb-1">{badge.name}</h3>
                    <p className="text-gray-500 text-sm mb-2">{badge.description}</p>
                    {badge.progress !== undefined && badge.requirement && (
                      <ProgressBar
                        progress={badge.progress}
                        max={badge.requirement}
                        showLabel={false}
                      />
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
