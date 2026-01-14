import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'

export default function AdminPanel() {
  const navigate = useNavigate()

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <h1 className="text-3xl font-bold text-white mb-6">Admin Panel 🔐</h1>

      <Card className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Platform Statistics</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">Total Users</p>
            <p className="text-2xl font-bold text-white">1,247</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Total Ads Watched</p>
            <p className="text-2xl font-bold text-white">45,892</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Total Payouts</p>
            <p className="text-2xl font-bold text-white">$12,456</p>
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400">New user registered</span>
            <span className="text-gray-500">2 mins ago</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400">Withdrawal processed</span>
            <span className="text-gray-500">15 mins ago</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-800">
            <span className="text-gray-400">New ad uploaded</span>
            <span className="text-gray-500">1 hour ago</span>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="space-y-2">
          <button 
            onClick={() => navigate('/admin/conversions')}
            className="w-full text-left px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
          >
            💰 Process Coin Conversions
          </button>
          <button className="w-full text-left px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors">
            📝 Create New Ad
          </button>
          <button className="w-full text-left px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors">
            👥 Manage Users
          </button>
          <button className="w-full text-left px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors">
            💸 Process Withdrawals
          </button>
          <button className="w-full text-left px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors">
            📊 View Reports
          </button>
        </div>
      </Card>
    </div>
  )
}
