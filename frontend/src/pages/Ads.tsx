import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

interface Ad {
  id: number
  title: string
  description: string
  durationSeconds: number
  rewardCents: number
}

export default function Ads() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [ads, setAds] = useState<Ad[]>([])

  useEffect(() => {
    // Simulate loading ads
    setTimeout(() => {
      setAds([
        {
          id: 1,
          title: 'Product Demo - New Tech Gadget',
          description: 'Watch our latest product demonstration',
          durationSeconds: 30,
          rewardCents: 5,
        },
        {
          id: 2,
          title: 'Brand Story - Fashion Collection',
          description: 'Discover our new fashion line',
          durationSeconds: 45,
          rewardCents: 8,
        },
        {
          id: 3,
          title: 'App Tutorial - Productivity Tools',
          description: 'Learn how to use our app',
          durationSeconds: 60,
          rewardCents: 10,
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

  if (ads.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6 pb-24">
        <h1 className="text-3xl font-bold text-white mb-6">Available Ads 📺</h1>
        <Card>
          <EmptyState
            icon="📭"
            title="No Ads Available"
            description="Check back later for new ads to watch and earn rewards."
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <h1 className="text-3xl font-bold text-white mb-6">Available Ads 📺</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {ads.map((ad) => (
          <Card key={ad.id}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-white">{ad.title}</h3>
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                +${(ad.rewardCents / 100).toFixed(2)}
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-4">{ad.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">⏱️ {ad.durationSeconds}s</span>
              <Button size="sm" onClick={() => navigate(`/watch/${ad.id}`)}>
                Watch Now
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
