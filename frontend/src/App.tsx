import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CurrencyProvider } from './contexts/CurrencyContext'
import { useInterstitialAd } from './hooks/useInterstitialAd'
import CookieConsent from './components/CookieConsent'
import TopHeader from './components/TopHeader'
import BottomNavigation from './components/BottomNavigation'
import FloatingHUD from './components/FloatingHUD'
import LoadingSpinner from './components/LoadingSpinner'
import Footer from './components/Footer'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import WatchAd from './pages/WatchAd'
import Game from './pages/Game'
import MiniGames from './pages/MiniGames'
import Settings from './pages/Settings'
import Leaderboard from './pages/Leaderboard'
import Badges from './pages/Badges'
import Subscriptions from './pages/Subscriptions'
import Referrals from './pages/Referrals'
import AdminPanel from './pages/AdminPanel'
import AdminConversions from './pages/AdminConversions'
import AdminRevenue from './pages/AdminRevenue'
import AdminLogs from './pages/AdminLogs'
import AdminExpiryIncome from './pages/AdminExpiryIncome'
import Transactions from './pages/Transactions'
import TermsOfService from './pages/TermsOfService'
import PrivacyPolicy from './pages/PrivacyPolicy'
import AdCity from './pages/AdCity'
import TaskCenter from './pages/TaskCenter'
import SurveysCategory from './pages/task-center/Surveys'
import OfferWallCategory from './pages/task-center/OfferWall'
import GameCenter from './pages/task-center/GameCenter'
import ShoppingCenter from './pages/task-center/ShoppingCenter'
import AdCenter from './pages/task-center/AdCenter'
import OffersCategory from './pages/task-center/Offers'
import VideosCategory from './pages/task-center/Videos'
import CashbackCategory from './pages/task-center/Cashback'
import AdStore from './pages/Shop'
import ShopNew from './pages/ShopNew'
import WalletV2 from './pages/WalletV2'

// Legal Pages
import Terms from './pages/legal/Terms'
import Privacy from './pages/legal/Privacy'
import Cookies from './pages/legal/Cookies'
import AdMob from './pages/legal/AdMob'
import Monetag from './pages/legal/Monetag'
import DeleteAccount from './pages/legal/DeleteAccount'

function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white text-center px-4">
      <div className="text-8xl mb-6">🔍</div>
      <h1 className="text-4xl font-bold mb-4">404 — Page Not Found</h1>
      <p className="text-gray-400 mb-8 max-w-md">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
      >
        Go to Dashboard
      </button>
    </div>
  )
}

function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode
  requireAdmin?: boolean
}) {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <LoadingSpinner size="large" withLogo={true} text="Loading..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black p-8 text-center">
        <div className="max-w-md">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-300 mb-6">
            You do not have permission to access this page. Admin privileges are
            required.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

function AppContent() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const isMemberHomeDashboard =
    isAuthenticated && location.pathname === '/dashboard'

  useInterstitialAd(location.pathname)

  return (
    <div
      className={`min-h-screen ${isMemberHomeDashboard ? 'bg-slate-950' : 'bg-black'}`}
    >
      {!isMemberHomeDashboard && <TopHeader />}
      <CookieConsent />
      {isAuthenticated && !isMemberHomeDashboard && <FloatingHUD />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

        <Route path="/legal/terms" element={<Terms />} />
        <Route path="/legal/privacy" element={<Privacy />} />
        <Route path="/legal/cookies" element={<Cookies />} />
        <Route path="/legal/admob" element={<AdMob />} />
        <Route path="/legal/monetag" element={<Monetag />} />
        <Route path="/legal/delete-account" element={<DeleteAccount />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ads"
          element={
            <ProtectedRoute>
              <WatchAd />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ad-city"
          element={
            <ProtectedRoute>
              <AdCity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/survey-center"
          element={<Navigate to="/task-center" replace />}
        />
        <Route
          path="/task-center"
          element={
            <ProtectedRoute>
              <TaskCenter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/task-center/surveys"
          element={
            <ProtectedRoute>
              <SurveysCategory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/task-center/offer-wall"
          element={
            <ProtectedRoute>
              <OfferWallCategory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/task-center/gaming"
          element={
            <ProtectedRoute>
              <GameCenter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/task-center/shopping"
          element={
            <ProtectedRoute>
              <ShoppingCenter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/task-center/ads"
          element={
            <ProtectedRoute>
              <AdCenter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/task-center/offers"
          element={
            <ProtectedRoute>
              <OffersCategory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/task-center/videos"
          element={
            <ProtectedRoute>
              <VideosCategory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/task-center/cashback"
          element={
            <ProtectedRoute>
              <CashbackCategory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop"
          element={
            <ProtectedRoute>
              <ShopNew />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ad-store"
          element={
            <ProtectedRoute>
              <AdStore />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <WalletV2 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/watch/:id"
          element={
            <ProtectedRoute>
              <WatchAd />
            </ProtectedRoute>
          }
        />
        <Route
          path="/watch-ad"
          element={
            <ProtectedRoute>
              <WatchAd />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game"
          element={
            <ProtectedRoute>
              <Game />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mini-games"
          element={
            <ProtectedRoute>
              <MiniGames />
            </ProtectedRoute>
          }
        />
        <Route
          path="/minigames"
          element={<Navigate to="/mini-games" replace />}
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/withdrawals"
          element={<Navigate to="/wallet" replace />}
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/badges"
          element={
            <ProtectedRoute>
              <Badges />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscriptions"
          element={
            <ProtectedRoute>
              <Subscriptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/referrals"
          element={
            <ProtectedRoute>
              <Referrals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/conversions"
          element={
            <ProtectedRoute requireAdmin>
              <AdminConversions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/revenue"
          element={
            <ProtectedRoute requireAdmin>
              <AdminRevenue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/logs"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/expiry-income"
          element={
            <ProtectedRoute requireAdmin>
              <AdminExpiryIncome />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {isAuthenticated && <BottomNavigation />}
      {!isMemberHomeDashboard && <Footer />}
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CurrencyProvider>
          <AppContent />
        </CurrencyProvider>
      </AuthProvider>
    </Router>
  )
}
