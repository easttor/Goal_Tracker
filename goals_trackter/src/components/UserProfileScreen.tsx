import React, { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth'
import { 
  User, Mail, Calendar, Trophy, Target, CheckCircle2, 
  Flame, LogOut, Settings, ChevronRight, Moon, Sun, Download,
  Users, Share2, MessageSquare, CreditCard, Sparkles, Crown,
  HelpCircle
} from 'lucide-react'
import { UserActivityService } from '../lib/userActivityService'
import { SocialService } from '../lib/socialService'
import ExportModal from './ExportModal'
import { UserSearchModal } from './UserSearchModal'
import { Goal, SocialStatistics } from '../types'
import BillingDashboardScreen from './BillingDashboardScreen'
import { subscriptionService, UserSubscription } from '../lib/subscriptionService'
import HelpScreen from './HelpScreen'

interface UserStats {
  totalGoals: number
  totalTasks: number
  totalHabits: number
  currentStreak: number
  bestStreak: number
  memberSince: string
}

interface UserProfileScreenProps {
  goals?: Goal[]
  onNavigate?: (page: string) => void
}

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ goals = [], onNavigate }) => {
  const { user, signOut } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [socialStats, setSocialStats] = useState<SocialStatistics | null>(null)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showUserSearch, setShowUserSearch] = useState(false)
  const [showBillingDashboard, setShowBillingDashboard] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    // Check dark mode preference
    setIsDarkMode(document.documentElement.classList.contains('dark'))
    
    // Load user stats
    if (user) {
      loadUserStats()
    }
  }, [user])

  const loadUserStats = async () => {
    try {
      setLoading(true)
      const activityStats = await UserActivityService.getActivityStats(user!.id)
      const socialData = await SocialService.getSocialStatistics(user!.id)
      const subscriptionData = await subscriptionService.getUserSubscription(user!.id)
      
      setStats({
        totalGoals: activityStats.totalGoalsCompleted || 0,
        totalTasks: activityStats.totalTasksCompleted || 0,
        totalHabits: activityStats.totalHabitsCompleted || 0,
        currentStreak: activityStats.currentStreak || 0,
        bestStreak: activityStats.bestStreak || 0,
        memberSince: user!.created_at || new Date().toISOString()
      })
      
      setSocialStats(socialData)
      setSubscription(subscriptionData)
    } catch (error) {
      console.error('Error loading user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (email: string) => {
    const name = email.split('@')[0]
    const parts = name.split(/[._-]/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const getGradientFromEmail = (email: string) => {
    const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-purple-500 to-pink-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-indigo-500 to-blue-600',
      'from-pink-500 to-rose-600'
    ]
    return gradients[hash % gradients.length]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const toggleDarkMode = () => {
    const html = document.documentElement
    if (html.classList.contains('dark')) {
      html.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setIsDarkMode(false)
    } else {
      html.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setIsDarkMode(true)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (!user) return null

  return (
    <div className="fade-in pb-8 relative min-h-screen">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: 'url(/images/profile_background_6.png)',
          filter: 'brightness(0.3)'
        }}
      />
      {/* Glass Overlay */}
      <div className="fixed inset-0 bg-white/20 dark:bg-black/30 backdrop-blur-sm -z-10" />
      
      {/* Header with Avatar */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 px-6 pt-12 pb-20 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center space-y-4">
          {/* Avatar */}
          <div className="inline-block">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getGradientFromEmail(user.email || '')} flex items-center justify-center text-3xl font-bold text-white shadow-2xl ring-4 ring-white/20`}>
              {getInitials(user.email || 'User')}
            </div>
          </div>

          {/* User Info */}
          <div>
            <h1 className="text-2xl font-bold">{user.email?.split('@')[0]}</h1>
            <p className="text-white/80 text-sm mt-1 flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              {user.email}
            </p>
            <p className="text-white/70 text-xs mt-2 flex items-center justify-center gap-2">
              <Calendar className="w-3 h-3" />
              Member since {formatDate(stats?.memberSince || user.created_at || new Date().toISOString())}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 -mt-12 relative z-20">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-4 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Your Achievements
          </h2>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading stats...</div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {/* Stat Item */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 text-center">
                <Target className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats?.totalGoals || 0}</div>
                <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">Goals Completed</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats?.totalTasks || 0}</div>
                <div className="text-xs text-green-700 dark:text-green-300 font-medium">Tasks Completed</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 text-center">
                <Flame className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats?.totalHabits || 0}</div>
                <div className="text-xs text-purple-700 dark:text-purple-300 font-medium">Habits Tracked</div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 text-center">
                <Flame className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats?.currentStreak || 0}</div>
                <div className="text-xs text-orange-700 dark:text-orange-300 font-medium">Day Streak</div>
              </div>
            </div>
          )}

          {/* Best Streak */}
          {stats && stats.bestStreak > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Best Streak</span>
                <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{stats.bestStreak} days</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Status Card */}
      <div className="px-4 mt-6">
        <div className="bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {subscription?.status === 'active' && subscription?.plan?.name === 'Pro' ? (
                  <Crown className="w-8 h-8 text-yellow-300" />
                ) : (
                  <Sparkles className="w-8 h-8" />
                )}
                <div>
                  <h3 className="text-xl font-bold">
                    {subscription?.plan?.name || 'Free'} Plan
                  </h3>
                  <p className="text-white/80 text-sm">
                    {subscription?.status === 'active' && subscription?.plan?.name === 'Pro' 
                      ? 'Premium Member' 
                      : 'Basic Access'}
                  </p>
                </div>
              </div>
              {subscription?.status === 'active' && subscription?.plan?.name === 'Pro' && (
                <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                  PRO
                </div>
              )}
            </div>

            {subscription?.status === 'active' && subscription?.plan?.name === 'Pro' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/80">Billing</span>
                  <span className="font-semibold">${subscription.billing_interval === 'yearly' ? subscription.plan.price_yearly : subscription.plan.price_monthly}/{subscription.billing_interval === 'yearly' ? 'year' : 'month'}</span>
                </div>
                {subscription.current_period_end && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/80">Next billing</span>
                    <span className="font-semibold">{new Date(subscription.current_period_end).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-white/90">
                  Unlock unlimited habits, goals, all templates, and advanced analytics.
                </p>
                <button 
                  onClick={() => onNavigate ? onNavigate('subscription') : setShowBillingDashboard(true)}
                  className="w-full bg-white text-purple-600 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                >
                  <Crown className="w-5 h-5" />
                  Upgrade to Pro - $4.99/month
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Social Statistics */}
      <div className="px-4 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            Social
          </h2>

          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading social stats...</div>
          ) : (
            <>
              {/* Social Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 text-center">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-purple-900 dark:text-purple-100">{socialStats?.followers || 0}</div>
                  <div className="text-xs text-purple-700 dark:text-purple-300 font-medium">Followers</div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 text-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-blue-900 dark:text-blue-100">{socialStats?.following || 0}</div>
                  <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">Following</div>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl p-4 text-center">
                  <Share2 className="w-6 h-6 text-pink-600 dark:text-pink-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-pink-900 dark:text-pink-100">{socialStats?.shared_goals || 0}</div>
                  <div className="text-xs text-pink-700 dark:text-pink-300 font-medium">Shared Goals</div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl p-4 text-center">
                  <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-indigo-900 dark:text-indigo-100">{socialStats?.team_goals || 0}</div>
                  <div className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">Team Goals</div>
                </div>
              </div>

              {/* Find Users Button */}
              <button
                onClick={() => setShowUserSearch(true)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
              >
                <Users className="w-5 h-5" />
                <span>Find Users</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Settings Section */}
      <div className="px-4 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Settings
            </h2>
          </div>

          {/* Theme Toggle */}
          <button 
            onClick={toggleDarkMode}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              {isDarkMode ? (
                <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-600" />
              )}
              <span className="font-medium text-gray-900 dark:text-white">
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-gray-300'} relative`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
            </div>
          </button>

          {/* Export Data Button */}
          <button 
            onClick={() => setShowExportModal(true)}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-gray-900 dark:text-white">
                Export Data
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          {/* Subscription & Billing */}
          <button 
            onClick={() => onNavigate ? onNavigate('subscription') : setShowBillingDashboard(true)}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <div className="text-left">
                <div className="font-medium text-gray-900 dark:text-white">
                  Subscription
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {subscription?.plan?.name || 'Free'} Plan
                  {subscription?.status === 'active' && subscription?.plan?.name === 'Pro' && (
                    <Sparkles className="inline w-3 h-3 ml-1 text-yellow-500" />
                  )}
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          {/* Help & Support Button */}
          <button 
            onClick={() => setShowHelp(true)}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="font-medium text-gray-900 dark:text-white">
                Help & Support
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Log Out</span>
            </div>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* App Info */}
      <div className="px-4 mt-6 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Goals Tracker v1.0
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Track your goals, build habits, achieve success
        </p>
      </div>

      {/* Export Modal */}
      {showExportModal && user && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          goals={goals}
          userId={user.id}
          userEmail={user.email || ''}
        />
      )}

      {/* User Search Modal */}
      {showUserSearch && (
        <UserSearchModal onClose={() => setShowUserSearch(false)} />
      )}

      {/* Billing Dashboard */}
      {showBillingDashboard && (
        <BillingDashboardScreen onClose={() => setShowBillingDashboard(false)} />
      )}

      {/* Help Screen */}
      {showHelp && (
        <HelpScreen onClose={() => setShowHelp(false)} />
      )}
    </div>
  )
}

export default UserProfileScreen
