import { useLocation, useNavigate } from 'react-router-dom'

interface NavItem {
  path: string
  icon: string
  label: string
}

const navItems: NavItem[] = [
  { path: '/dashboard', icon: '🏠', label: 'Home' },
  { path: '/ads', icon: '📺', label: 'Ads' },
  { path: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
  { path: '/settings', icon: '⚙️', label: 'Settings' },
]

export default function BottomNavigation() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center py-3 px-4 transition-colors ${
                  isActive ? 'text-blue-500' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <span className="text-2xl mb-1">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
