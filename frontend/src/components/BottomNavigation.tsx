import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface BottomNavItem {
  path: string
  icon: string
  label: string
  isActive: (pathname: string) => boolean
}

interface DrawerItem {
  path: string
  icon: string
  label: string
}

const bottomNavItems: BottomNavItem[] = [
  {
    path: '/dashboard',
    icon: '🏠',
    label: 'Home',
    isActive: (pathname) => pathname === '/dashboard',
  },
  {
    path: '/task-center',
    icon: '✅',
    label: 'Earn',
    isActive: (pathname) =>
      pathname === '/task-center' || pathname.startsWith('/task-center/'),
  },
  {
    path: '/shop',
    icon: '🛍️',
    label: 'Store',
    isActive: (pathname) => pathname === '/shop',
  },
  {
    path: '/leaderboard',
    icon: '🏆',
    label: 'Ranks',
    isActive: (pathname) => pathname === '/leaderboard',
  },
]

const drawerItems: DrawerItem[] = [
  { path: '/wallet', icon: '💼', label: 'Wallet' },
  { path: '/transactions', icon: '📋', label: 'History' },
  { path: '/referrals', icon: '👥', label: 'Referrals' },
  { path: '/badges', icon: '🏅', label: 'Badges' },
  { path: '/settings', icon: '⚙️', label: 'Settings' },
]

const drawerLegalItems: DrawerItem[] = [
  { path: '/legal/terms', icon: '📄', label: 'Terms of Service' },
  { path: '/legal/privacy', icon: '🔒', label: 'Privacy Policy' },
]

export default function BottomNavigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const pathname = location.pathname
  const drawerRoutePaths = useMemo(
    () => [...drawerItems, ...drawerLegalItems].map((item) => item.path),
    [],
  )

  const isMoreActive = drawerRoutePaths.some((path) => pathname === path)

  const displayName =
    user?.user_metadata?.displayName ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Member'

  const coinBalanceRaw =
    (user as { coinsBalance?: number } | null)?.coinsBalance ??
    (user?.user_metadata?.coinsBalance as number | undefined) ??
    0
  const coinBalance = Number.isFinite(Number(coinBalanceRaw))
    ? Number(coinBalanceRaw)
    : 0

  const handleDrawerNavigation = (path: string) => {
    setIsDrawerOpen(false)
    navigate(path)
  }

  const handleSignOut = async () => {
    setIsDrawerOpen(false)
    await signOut()
    navigate('/login')
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-900">
        <div className="mx-auto w-full max-w-7xl px-2 sm:px-4">
          <div className="grid grid-cols-5">
            {bottomNavItems.map((item) => {
              const isActive = item.isActive(pathname)
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center py-3 text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-blue-500'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="mb-1 text-xl" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              )
            })}

            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className={`flex flex-col items-center justify-center py-3 text-xs font-medium transition-colors ${
                isMoreActive || isDrawerOpen
                  ? 'text-blue-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="mb-1 text-xl" aria-hidden="true">
                ☰
              </span>
              <span>More</span>
            </button>
          </div>
        </div>
      </nav>

      {isDrawerOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 z-[60] bg-black/50"
        />
      )}

      <aside
        className={`fixed bottom-0 right-0 top-0 z-[70] w-80 max-w-[85vw] transform border-l border-slate-800 bg-slate-950 transition-transform duration-200 ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isDrawerOpen}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-800 px-5 py-4">
            <p className="text-sm text-slate-400">Signed in as</p>
            <p className="mt-1 text-lg font-semibold text-slate-100">
              {displayName}
            </p>
            <p className="mt-2 text-sm font-medium text-blue-400">
              {coinBalance.toLocaleString()} AD COINS
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3">
            {drawerItems.map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => handleDrawerNavigation(item.path)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-200 transition-colors hover:bg-slate-800"
              >
                <span className="text-lg" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            ))}

            <div className="my-3 border-t border-slate-800" />

            {drawerLegalItems.map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => handleDrawerNavigation(item.path)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-200 transition-colors hover:bg-slate-800"
              >
                <span className="text-lg" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            ))}

            <div className="my-3 border-t border-slate-800" />

            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-red-300 transition-colors hover:bg-red-500/10"
            >
              <span className="text-lg" aria-hidden="true">
                🚪
              </span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
