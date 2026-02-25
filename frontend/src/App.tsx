import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import WatchAd from './pages/WatchAd'
import Layout from './components/Layout'

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/watch-ad" element={<WatchAd />} />
            <Route path="/" element={<Navigate to="/watch-ad" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  )
}
