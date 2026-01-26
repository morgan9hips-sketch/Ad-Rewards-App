import { useAuth } from '../contexts/AuthContext'
import Logo from './Logo'
import Button from './Button'
import { useNavigate } from 'react-router-dom'

export default function TopHeader() {
  const { user, isAuthenticated, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleLogoClick = () => {
    navigate(isAuthenticated ? '/dashboard' : '/')
  }

  const handleLogoKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleLogoClick()
    }
  }

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Responsive logo display: Full logo for desktop (≥640px), Icon for mobile (<640px) */}
        {/* Using separate instances for cleaner code than internal media queries */}
        <div 
          className="hidden sm:block cursor-pointer" 
          onClick={handleLogoClick}
          onKeyDown={handleLogoKeyDown}
          role="button"
          tabIndex={0}
          aria-label="Go to home"
        >
          <Logo size="md" variant="full" />
        </div>
        <div 
          className="block sm:hidden cursor-pointer" 
          onClick={handleLogoClick}
          onKeyDown={handleLogoKeyDown}
          role="button"
          tabIndex={0}
          aria-label="Go to home"
        >
          <Logo size="sm" variant="icon" />
        </div>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-gray-400 text-sm hidden sm:block">
                {user?.email}
              </span>
              <Button size="sm" variant="secondary" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
